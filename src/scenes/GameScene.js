import { CONFIG } from '../config.js';
import GameState from '../state/GameState.js';
import WaveManager from '../systems/WaveManager.js';
import IdleManager from '../systems/IdleManager.js';
import SaveManager from '../systems/SaveManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import SoulDebtManager from '../systems/SoulDebtManager.js';
import VeteranManager from '../systems/VeteranManager.js';
import PrestigeManager from '../systems/PrestigeManager.js';
import Necromancer from '../entities/Necromancer.js';
import Defender from '../entities/Defender.js';
import { formatNumber } from '../utils/NumberFormatter.js';
import AssetProvider from '../systems/AssetProvider.js';
import { t as i18n } from '../i18n/index.js';
import Enemy from '../entities/Enemy.js';
import Projectile from '../entities/Projectile.js';
import ObjectPool from '../systems/ObjectPool.js';

/**
 * GameScene — Ana savaş alanı.
 * Duvar, hat ihlali, şeritler, savunucular, dalga yönetimi.
 */
export default class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    // Oyun gerçekten başladı — otomatik kaydı burada başlat
    // (menüdeyken kaydın bozulmaması için Boot'tan buraya taşındı)
    SaveManager.startAutoSave();

    // Nesne havuzları — Enemy ve Projectile recycling (Faz 10 object pooling).
    // GameScene ömrü boyunca yaşar; shutdown'da drain edilir.
    this.enemyPool = new ObjectPool((pool, ...args) => new Enemy(...args));
    this.projectilePool = new ObjectPool((pool, ...args) => new Projectile(...args));
    this.events.once('shutdown', () => {
      this.enemyPool?.drain();
      this.projectilePool?.drain();
      if (this._floorBreakEls) { this._floorBreakEls.forEach(el => el.destroy()); this._floorBreakEls = null; }
    });

    AssetProvider.createAnims(this);
    this.drawBackground();
    this.drawWall();
    this.drawObstacles(); // K27: yıkıntı-dungeon engelleri (lane yerine topografya)

    // Necromancer — başlangıç birimi (K25), hep sahnede, sabit konum
    this.necromancer = new Necromancer(this, CONFIG.WALL_X + 40, Math.round((CONFIG.CORRIDOR_TOP + CONFIG.CORRIDOR_BOTTOM) / 2));
    this.isGameOver = false;
    // Yerleştirme modu (K36): hire → oyuncu birimi istediği yere koyar
    this._placing = null; // { type, unit } — şu an yerleştirilen birim
    this.game.events.off('start-placement', this.onStartPlacement, this);
    this.game.events.on('start-placement', this.onStartPlacement, this);
    this.events.once('shutdown', () => this.game.events.off('start-placement', this.onStartPlacement, this));
    // ESC: yerleştirme iptali — birim default çıpasında kalır (soul zaten harcandı; iade sonra)
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this._placing) {
        const u = this._placing.unit;
        if (u?.sprite) u.sprite.setAlpha(1);
        // default çıpaya geri koy
        if (u) { u.x = u.anchorX; u.y = u.anchorY; u.sprite?.setPosition(u.x, u.y); }
        this._placing = null;
        if (this._placeHint) this._placeHint.setVisible(false);
      }
    });
    // Necromancer canını başlat (yeni oyun) — yüklenen save applyLoad'da üzerine yazar
    if (GameState.necromancer.hp == null || GameState.necromancer.hp <= 0) {
      GameState.necromancer.hp = GameState.necromancer.maxHp;
    }

    // Tık yönetimi (K24/K25): öncelik sırası —
    //  1) Seçili birim varsa + boş zemine tık → birimi oraya taşı (çıpa güncelle)
    //  2) Bir birime tık → o birimi SEÇ (taşımaya hazırla)
    //  3) Bir düşmana tık → necromancer'a yapışkan hedef (K25)
    this._selectedUnit = null;
    this.input.on('pointerdown', (pointer) => {
      if (this.isGameOver) return;
      const px = pointer.worldX, py = pointer.worldY;

      // 0) Yerleştirme modu (K36): tık = birimi oraya koy (savaş alanı içinde)
      if (this._placing) {
        if (px > CONFIG.WALL_X && px < CONFIG.CANVAS_WIDTH && py > CONFIG.CORRIDOR_TOP && py < CONFIG.CORRIDOR_BOTTOM) {
          this._commitPlacement(px, py);
        }
        return; // yerleştirme modunda başka tık işlemi yok
      }

      // Birime tık? (en yakın birim, 30px)
      let unit = null, ud = 30 * 30;
      for (const u of this.getAllUnits()) {
        if (!u.alive || !u.sprite) continue;
        const dx = u.x - px, dy = u.y - py;
        const d = dx * dx + dy * dy;
        if (d < ud) { ud = d; unit = u; }
      }
      if (unit) { this._selectUnit(unit); return; }

      // Düşmana tık? (necromancer hedefi, 40px)
      const enemies = this.waveManager?.enemies || [];
      let nearest = null, nd = 40 * 40;
      for (const e of enemies) {
        if (!e.alive || e.dying || !e.sprite) continue;
        const dx = e.sprite.x - px, dy = e.sprite.y - py;
        const d = dx * dx + dy * dy;
        if (d < nd) { nd = d; nearest = e; }
      }
      if (nearest) { this.necromancer.setStickyTarget(nearest); this._showTargetMarker(nearest); return; }

      // Boş zemin + seçili birim → taşı (yalnız savaş alanı içinde)
      if (this._selectedUnit && px > CONFIG.WALL_X && px < CONFIG.CANVAS_WIDTH &&
          py > CONFIG.CORRIDOR_TOP && py < CONFIG.CORRIDOR_BOTTOM) {
        this._moveUnitAnchor(this._selectedUnit, px, py);
      }
    });
    // Defender registry (Faz G mimari): anahtar → canlı birim dizisi.
    // necromancer(laser) hariç tüm DEFENDERS anahtarları; yeni karakter = config'e obje, burası otomatik.
    this.defenderKeys = Object.keys(CONFIG.DEFENDERS).filter(k => k !== 'necromancer');
    this.defenders = {};
    for (const k of this.defenderKeys) this.defenders[k] = [];

    // Dalga yöneticisi
    this.waveManager = new WaveManager(this);

    // Soul-debt / otomatik diriltme yöneticisi (K11/K33) — Faz D.
    // Birim ölümü→diriltme tetiği Faz E'de (dur-dövüş) bağlanır; sistem hazır bekler.
    SoulDebtManager.init(this);
    VeteranManager.init(this); // kıdem sistemi (K37)

    // Floating text listesi
    this.floatingTexts = [];

    // Event dinleyicileri
    this.events.on('enemy-killed', this.onEnemyKilled, this);
    this.events.on('wave-complete', this.onWaveComplete, this);
    this.events.on('boss-wave', this.onBossWave, this);
    this.events.on('god-wave', this.onGodWave, this);
    this.events.on('god-defeated', this._onGodDefeated, this);
    // Kıdem/diriltme (K37): ölüm → iptal göstergesi; dirilme/iptal → göstergeyi kaldır
    this.events.on('unit-died', this._onUnitDied, this);
    this.events.on('unit-revived', this._onUnitRevivedUi, this);
    // Kat-arası tam-duraklama (K28): kat sonu → kurulum fazı banner + "İn" butonu
    this.events.on('floor-break', this._onFloorBreak, this);

    // Kritik vuruş bildirimi
    this.game.events.off('crit-hit', this.onCritHit, this);
    this.game.events.on('crit-hit', this.onCritHit, this);
    this.events.once('shutdown', () => this.game.events.off('crit-hit', this.onCritHit, this));

    // Dev panel: belirli bir wave'e atla
    this.game.events.off('dev-jump-wave', this.onDevJumpWave, this);
    this.game.events.on('dev-jump-wave', this.onDevJumpWave, this);
    this.events.once('shutdown', () => this.game.events.off('dev-jump-wave', this.onDevJumpWave, this));

    // Upgrade alınınca ilgili savunucu(lar) kısa bir pulse yapsın
    this.game.events.off('defender-upgraded', this.onDefenderUpgraded, this);
    this.game.events.on('defender-upgraded', this.onDefenderUpgraded, this);
    this.events.once('shutdown', () => this.game.events.off('defender-upgraded', this.onDefenderUpgraded, this));

    // Splitter: ölünce çocuklar spawn olur
    this.game.events.off('enemy-split', this.onEnemySplit, this);
    this.game.events.on('enemy-split', this.onEnemySplit, this);
    this.events.once('shutdown', () => this.game.events.off('enemy-split', this.onEnemySplit, this));

    // UIScene'i başlat
    this.scene.launch('UIScene');

    // Idle kazancı varsa popup göster
    const idleEarnings = this.registry.get('idleEarnings');
    if (idleEarnings) {
      this.registry.remove('idleEarnings');
      this.showIdlePopup(idleEarnings);
    }

    // Kazanım hızı örnekleyici başlangıcı (idle için gerçek soul/meta/sn)
    this._rateSampleTime = 0;
    this._lastRateSoul = GameState.stats.totalSoulEarned;
    this._lastRateMeta = GameState.stats.totalMetaEarned;
  }

  /** Idle gelir popup'ı gösterir. */
  showIdlePopup(earnings) {
    const cx = CONFIG.CANVAS_WIDTH / 2;
    const cy = CONFIG.CANVAS_HEIGHT / 2;

    // Arka plan
    const bg = this.add.rectangle(cx, cy, 320, 180, 0x0a0a2a, 0.95).setDepth(300).setStrokeStyle(2, 0xffd700);
    const hours = Math.floor(earnings.elapsedSeconds / 3600);
    const mins = Math.floor((earnings.elapsedSeconds % 3600) / 60);
    const timeStr = hours > 0 ? i18n('idle.timeHM', { h: hours, m: mins }) : i18n('idle.timeM', { m: mins });

    const title = this.add.text(cx, cy - 60, i18n('idle.welcomeBack'), {
      fontSize: '18px', fontFamily: 'monospace', color: '#ffd700',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(301);

    const info = this.add.text(cx, cy - 25, i18n('idle.awayFor', { time: timeStr }), {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaaaa',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5).setDepth(301);

    const soulLine = this.add.text(cx, cy + 5, i18n('idle.soulGain', { n: formatNumber(earnings.soul) }), {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffd700',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5).setDepth(301);

    const metaLine = this.add.text(cx, cy + 30, i18n('idle.metaGain', { n: formatNumber(earnings.meta) }), {
      fontSize: '16px', fontFamily: 'monospace', color: '#66ff66',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5).setDepth(301);

    // Topla butonu
    const collectBtn = this.add.rectangle(cx, cy + 65, 120, 30, 0x1a6a1a).setDepth(302).setInteractive({ useHandCursor: true });
    const collectLabel = this.add.text(cx, cy + 65, i18n('idle.collect'), {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffffff',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5).setDepth(303);

    collectBtn.on('pointerover', () => collectBtn.setFillStyle(0x2a8a2a));
    collectBtn.on('pointerout', () => collectBtn.setFillStyle(0x1a6a1a));
    collectBtn.on('pointerdown', () => {
      IdleManager.applyEarnings(earnings);
      // Toplanan lump'ı kazanım hızına saymamak için baseline'ı güncelle
      this._lastRateSoul = GameState.stats.totalSoulEarned;
      this._lastRateMeta = GameState.stats.totalMetaEarned;
      // Elementleri temizle
      [bg, title, info, soulLine, metaLine, collectBtn, collectLabel].forEach(el => el.destroy());
    });
  }

  // ═══════════════ Çizim ═══════════════
  drawBackground() {
    const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;

    // Gökyüzü — hafif dikey degrade (üst koyu → ufka doğru biraz açılır)
    const sky = this.add.graphics().setDepth(0);
    sky.fillGradientStyle(
      CONFIG.COLORS.SKY_TOP, CONFIG.COLORS.SKY_TOP,
      CONFIG.COLORS.SKY_BOTTOM, CONFIG.COLORS.SKY_BOTTOM, 1
    );
    sky.fillRect(0, 0, W, H);

    // Zemin bandı (koridor) — gökyüzüyle aynı aileden, bir tık koyu lacivert
    const groundTop = CONFIG.CORRIDOR_BOTTOM - 100;  // zemin bandi oyun alaninin altini kaplar
    const groundH = 150;
    this.add.rectangle(W / 2, groundTop + groundH / 2, W, groundH, CONFIG.COLORS.GROUND).setDepth(0);

    // Ufuk / zemin üst kenarı — ince vurgu çizgisi
    this.add.rectangle(W / 2, groundTop, W, 2, CONFIG.COLORS.GROUND_EDGE, 0.6).setDepth(0);
  }

  drawWall() {
    const wallH = CONFIG.CORRIDOR_BOTTOM - CONFIG.CORRIDOR_TOP;
    // Ana duvar
    const wallCenterY = CONFIG.CORRIDOR_TOP + wallH / 2;
    this.add.rectangle(CONFIG.WALL_X, wallCenterY, 36, wallH, CONFIG.COLORS.WALL).setDepth(2);
    // Üst kısım
    this.add.rectangle(CONFIG.WALL_X, CONFIG.CORRIDOR_TOP, 40, 8, CONFIG.COLORS.WALL_TOP).setDepth(3);

    // Tuğla deseni
    const brickG = this.add.graphics().setDepth(3);
    brickG.lineStyle(1, 0x3a3a5a, 0.4);
    for (let row = 0; row < wallH / 12; row++) {
      const by = CONFIG.CORRIDOR_TOP + row * 12;
      brickG.lineBetween(CONFIG.WALL_X - 15, by, CONFIG.WALL_X + 15, by);
      const offset = row % 2 === 0 ? 0 : 10;
      for (let bx = CONFIG.WALL_X - 15 + offset; bx < CONFIG.WALL_X + 15; bx += 20) {
        brickG.lineBetween(bx, by, bx, by + 12);
      }
    }
  }


  /** K27: MVP yıkıntı-dungeon zemini — hafif engel/doku işaretleri (placeholder).
   *  Gerçek engel-çarpışması + köprü/dar-boğaz Faz E cilası/sonraki iterasyon; şimdilik görsel. */
  drawObstacles() {
    const g = this.add.graphics().setDepth(1);
    // Zemin dokusu: hafif noktalar (lane çizgileri yerine organik his)
    g.fillStyle(CONFIG.COLORS.GROUND_LIGHT, 0.15);
    for (let i = 0; i < 40; i++) {
      const x = 180 + Math.random() * (CONFIG.CANVAS_WIDTH - 200);
      const y = CONFIG.CORRIDOR_TOP + Math.random() * (CONFIG.CORRIDOR_BOTTOM - CONFIG.CORRIDOR_TOP);
      g.fillCircle(x, y, 1 + Math.random() * 1.5);
    }
  }

  // ═══════════════ Güncelleme ═══════════════
  update(time, deltaMs) {
    if (this.isGameOver) return; // koşu bitti — simülasyon durur (K26 ölüm)
    // Oyun hızı çarpanı (dev panel) — tüm simülasyona uygulanır
    const delta = (deltaMs / 1000) * (CONFIG.DEBUG?.timeScale ?? 1);

    // Dalga yöneticisi
    this.waveManager.update(delta);

    // Soul-debt: borç zaman erimesi + diriltme kuyruğu (K11/K33)
    SoulDebtManager.reduceDebt(CONFIG.SOUL_DEBT.debtDecayPerSecond * delta);
    SoulDebtManager.update(delta);

    // Tüm düşmanlar listesi
    const enemies = this.waveManager.enemies;

    // Necromancer (her zaman aktif)
    this.necromancer.update(delta, enemies);
    // Birim HP barları (dur-dövüş görünürlüğü — K34)
    this._drawUnitHpBars();

    // Yerleştirme önizlemesi: birim fareyi takip etsin (K36)
    if (this._placing && this._placing.unit?.sprite) {
      const p = this.input.activePointer;
      const u = this._placing.unit;
      u.x = p.worldX; u.y = p.worldY;
      u.sprite.setPosition(u.x, u.y);
    }

    // Tüm savunucular — registry döngüsü (tek Defender sınıfı, config-driven)
    for (const key of this.defenderKeys) {
      const list = this.defenders[key];
      this.syncDefenders(key, list);
      for (const d of list) d.update(delta, enemies);
    }

    // Floating text güncelleme
    this.updateFloatingTexts(delta);

    // Başarım kontrolü (gerçek zamanlı ~1 sn'de bir)
    this._achvTimer = (this._achvTimer ?? 0) - deltaMs / 1000;
    if (this._achvTimer <= 0) { this._achvTimer = 1; AchievementManager.check(); }

    // Kazanım hızı örnekleme (idle gelir için gerçek soul/meta/sn, EMA ile)
    this._rateSampleTime = (this._rateSampleTime ?? 0) + deltaMs / 1000;
    if (this._rateSampleTime >= 2) {
      const dt = this._rateSampleTime;
      const dSoul = Math.max(0, GameState.stats.totalSoulEarned - (this._lastRateSoul ?? GameState.stats.totalSoulEarned));
      const dMeta = Math.max(0, GameState.stats.totalMetaEarned - (this._lastRateMeta ?? GameState.stats.totalMetaEarned));
      const a = 0.3; // EMA yumuşatma
      GameState.meta.soulRate = (GameState.meta.soulRate || 0) * (1 - a) + (dSoul / dt) * a;
      GameState.meta.metaRate = (GameState.meta.metaRate || 0) * (1 - a) + (dMeta / dt) * a;
      this._lastRateSoul = GameState.stats.totalSoulEarned;
      this._lastRateMeta = GameState.stats.totalMetaEarned;
      this._rateSampleTime = 0;
    }
  }

  /** Savunucu sayısını GameState ile senkronize eder (K24 serbest yerleşim).
   *  Yeni birim bir BAŞLANGIÇ çıpasına yerleşir (melee öne, ranged arkaya); oyuncu sonra
   *  savaş/kurulum fazında tıklayıp seçtiği birimi taşıyabilir (placeAnchor). */
  syncDefenders(type, list) {
    const state = GameState.defenders[type];
    const targetCount = state.count || 0;

    while (list.length < targetCount) {
      const idx = list.length;
      const combatType = CONFIG.DEFENDERS[type]?.combatType || 'ranged';
      // Varsayılan başlangıç çıpası: melee tıkaçlar öne (düşmana yakın), ranged arkaya (necromancer yanı).
      // Oyuncu bunları taşıyana kadar makul bir savunma dizilimi.
      const frontX = CONFIG.WALL_X + 120;  // melee öne
      const backX = CONFIG.WALL_X + 50;    // ranged arkaya
      const x = combatType === 'melee' ? frontX : backX;
      const bandTop = CONFIG.CORRIDOR_TOP + 30;
      const bandH = (CONFIG.CORRIDOR_BOTTOM - CONFIG.CORRIDOR_TOP) - 60;
      const y = bandTop + ((idx * 53) % bandH); // dikeyde yay (çakışmayı azalt)
      list.push(new Defender(this, type, x, y, idx));
    }

    while (list.length > targetCount) {
      const removed = list.pop();
      removed.destroy();
    }
  }

  /** Dur-dövüş için: sahadaki tüm canlı MELEE birimleri (K34 tıkaçlar). Enemy._findBlocker çağırır. */
  getMeleeBlockers() {
    return this.getAllUnits().filter(d => d.alive && d.combatType === 'melee');
  }

  /** Tüm dizilebilir birimler (necromancer hariç) — taşıma/HP bar/absorbe için. */
  getAllUnits() {
    const out = [];
    for (const key of this.defenderKeys) out.push(...this.defenders[key]);
    return out;
  }

  // ═══════════════ Olaylar ═══════════════
  onEnemyKilled(data) {
    if (data.soul > 0) {
      this.showFloatingText(i18n('game.soulGain', { n: Math.floor(data.soul) }), data.x, data.y - 10, CONFIG.COLORS.UI_GOLD);
    }
    if (data.meta > 0) {
      this.showFloatingText(i18n('game.metaGain', { n: Math.floor(data.meta) }), data.x, data.y + 5, CONFIG.COLORS.ENEMY_FOOD);
    }
    // Ölüm parçacık efekti
    this.spawnDeathParticles(data.x, data.y, data.killedBy);
    // Elite / boss ölümünde kamera sarsıntısı (boss daha güçlü)
    if (CONFIG.FX?.screenShake && (data.type === 'cursedKnight' || data.type === 'boss')) {
      const big = data.type === 'boss';
      this.cameras.main.shake(big ? 350 : 180, big ? 0.016 : 0.008);
    }
    if (data.type === 'boss') {
      this.showFloatingText(i18n('game.bossDefeated'), CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 40, 0xffd700, 26, 1800);
    }
  }

  /** Kritik vuruşta "CRIT!" bildirimi. */
  onCritHit(data) {
    this.showFloatingText(i18n('game.crit'), data.x, data.y - 16, 0xff8800, 16, 700);
  }

  /** Tanrı dalgası girişinde duyuru (K26 final). */
  onGodWave(data) {
    this.showFloatingText(i18n('game.godWave'), CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 50, 0xffd700, 26, 2800);
    this.game.events.emit('sfx', 'prestige');
    if (CONFIG.FX?.screenShake) this.cameras.main.shake(400, 0.012);
  }

  /** Boss dalgası girişinde duyuru. */
  onBossWave(data) {
    const bossName = data.bossType ? i18n(`enemy.${data.bossType}`) : i18n('game.boss');
    this.showFloatingText(i18n('game.bossWave', { boss: bossName, wave: data.wave }), CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 50, 0xff4444, 24, 2000);
    this.game.events.emit('sfx', 'prestige');
  }

  /** Basit ölüm parçacık efekti. */
  spawnDeathParticles(x, y, killedBy) {
    const color = killedBy === 'breach' ? 0xcc3333
      : killedBy === 'unitDeath' ? 0xc9b3ff  // birim ölümü: soul moru (iskelet dağılır)
      : 0xffffff;
    const count = 6;
    for (let i = 0; i < count; i++) {
      const px = x + (Math.random() - 0.5) * 10;
      const py = y + (Math.random() - 0.5) * 10;
      const size = 2 + Math.random() * 3;
      const p = this.add.circle(px, py, size, color, 0.8).setDepth(40);
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      this.tweens.add({
        targets: p,
        x: px + Math.cos(angle) * dist,
        y: py + Math.sin(angle) * dist,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  onWaveComplete(data) {
    this.showFloatingText(
      i18n('game.waveComplete', { n: data.completedWave }),
      CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 30,
      0xffd700, 24, 1500
    );
    // Kat sonu (her 10 wave) necromancer canı full dolar (K7/K10)
    const floorSize = CONFIG.WAVES.bossEvery || 10;
    if (CONFIG.NECROMANCER.floorHealFull && data.completedWave % floorSize === 0) {
      GameState.necromancer.hp = GameState.necromancer.maxHp;
      this.showFloatingText(i18n('game.necromancerHealed'), this.necromancer.x, this.necromancer.y - 30, 0x66ff88, 16, 1400);
    }
  }

  /** Upgrade geri bildirimi: ilgili savunucu sprite'larını kısa pulse ile büyüt. */
  onDefenderUpgraded(data) {
    const type = data && data.type;
    const list = type === 'necromancer' ? [this.necromancer] : (this.defenders[type] || []);
    for (const d of list) {
      if (!d || !d.sprite) continue;
      this.tweens.add({
        targets: d.sprite, scaleX: 1.35, scaleY: 1.35,
        duration: 110, yoyo: true, ease: 'Quad.easeOut',
      });
    }
  }

  /**
   * Kat sonu — tam-duraklama kurulum fazı (K28). Savaş durdu (WaveManager.isFloorBreak); oyuncu
   * sakin kafayla dizer/örer/absorbe eder/ölüleri gözden geçirir. Hafif banner + "İN" butonu;
   * savaş alanını KAPATMAZ (oyuncu arkada birim yerleştirebilsin).
   */
  _onFloorBreak(data) {
    const floor = data?.completedFloor ?? '';
    const cx = CONFIG.CANVAS_WIDTH / 2;
    const els = [];
    // Üst banner (hafif şerit — savaş alanını örtmez)
    const band = this.add.rectangle(cx, CONFIG.CORRIDOR_TOP + 44, CONFIG.CANVAS_WIDTH, 52, 0x0a0a2a, 0)
      .setDepth(300);
    this.tweens.add({ targets: band, fillAlpha: 0.7, duration: 300 });
    const title = this.add.text(cx, CONFIG.CORRIDOR_TOP + 34, i18n('game.floorCleared', { n: floor }), {
      fontSize: '18px', fontFamily: 'monospace', color: '#c9b3ff', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(301);
    const hint = this.add.text(cx, CONFIG.CORRIDOR_TOP + 56, i18n('game.floorSetupHint'), {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaaaaa', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(301);
    // "İN" butonu (alt-orta, savaş alanının altında)
    const by = CONFIG.CORRIDOR_BOTTOM - 10;
    const btn = this.add.rectangle(cx, by, 160, 34, 0x2a1a3a).setDepth(301).setStrokeStyle(2, 0xc9b3ff).setInteractive({ useHandCursor: true });
    const btnLabel = this.add.text(cx, by, i18n('game.descendNext'), {
      fontSize: '15px', fontFamily: 'monospace', color: '#ffffff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(302);
    els.push(band, title, hint, btn, btnLabel);
    btn.on('pointerover', () => btn.setFillStyle(0x3a2a5a));
    btn.on('pointerout', () => btn.setFillStyle(0x2a1a3a));
    btn.on('pointerdown', (p, x, y, e) => {
      e?.stopPropagation?.();
      this.waveManager?.resumeFromFloorBreak();
      for (const el of els) el.destroy();
      this._floorBreakEls = null;
    });
    this._floorBreakEls = els;
  }

  /** Birim öldü — konumunda tıklanabilir "✕" iptal göstergesi (K37, anlık karar). */
  _onUnitDied(data) {
    const unit = data?.unit;
    if (!unit) return;
    if (unit._cancelBtn) { unit._cancelBtn.destroy(); unit._cancelBtn = null; }
    const vet = unit.veteranLevel > 0 ? i18n('game.cancelReviveVet', { n: unit.veteranLevel }) : i18n('game.cancelRevive');
    const btn = this.add.text(unit.x, unit.y, vet, {
      fontSize: '13px', fontFamily: 'monospace',
      color: unit.veteranLevel > 0 ? '#ffd24a' : '#ff6666',
      backgroundColor: '#000000aa', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(60).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', (p, x, y, e) => {
      e?.stopPropagation?.(); // zemin tık'ına düşmesin (birim taşıma/necromancer hedefi)
      SoulDebtManager.cancelRevive(unit);
    });
    unit._cancelBtn = btn;
  }

  /** Birim diriltildi — iptal göstergesini kaldır (artık sahada canlı). */
  _onUnitRevivedUi(data) {
    const unit = data?.unit;
    if (unit?._cancelBtn) { unit._cancelBtn.destroy(); unit._cancelBtn = null; }
  }

  /**
   * Diriltme iptal edildi — birimi KALICI kaldır (K37). count--, listeden çıkar, kıdem sıfırla,
   * destroy. syncDefenders count'u state'ten okur, bu yüzden count azaltılmazsa birim geri yaratılır.
   */
  permanentlyRemoveUnit(unit) {
    if (!unit) return;
    VeteranManager.resetVeteran(unit); // kıdem kaybı — diriltmemenin bedeli
    const list = this.defenders[unit.type];
    if (list) {
      const i = list.indexOf(unit);
      if (i !== -1) list.splice(i, 1);
    }
    const st = GameState.defenders[unit.type];
    if (st && st.count > 0) st.count -= 1; // kalıcı kayıp — syncDefenders geri yaratmasın
    if (unit._cancelBtn) { unit._cancelBtn.destroy(); unit._cancelBtn = null; }
    unit.destroy?.();
  }

  /** Kıdem atlayan birime altın pulse + parıltı + "Kıdem N" metni (K37 geri bildirim). */
  onVeteranLevelUp(unit) {
    if (!unit || !unit.sprite) return;
    this.tweens.add({
      targets: unit.sprite, scaleX: 1.4, scaleY: 1.4,
      duration: 130, yoyo: true, ease: 'Back.easeOut',
    });
    const ring = this.add.circle(unit.x, unit.y, 18, 0xffd24a, 0.5).setDepth(14);
    this.tweens.add({
      targets: ring, scaleX: 2.2, scaleY: 2.2, alpha: 0, duration: 400, ease: 'Power2',
      onComplete: () => ring.destroy(),
    });
    this.showFloatingText?.(i18n('game.veteranUp', { n: unit.veteranLevel }), unit.x, unit.y - 24, 0xffd24a, 13, 1100);
  }

  /** Splitter öldü — WaveManager çocukları spawn etsin. */
  onEnemySplit(data) {
    if (this.waveManager) this.waveManager.spawnChildren(data);
  }

  /** Hat ihlali — necromancer can havuzundan kesinti (K13). Enemy.breachLine çağırır. */
  damageNecromancer(amount) {
    if (this.isGameOver) return;
    const n = GameState.necromancer;
    n.hp = Math.max(0, n.hp - amount);
    // Necromancer sprite'ında kısa kırmızı flash + hafif kamera sarsıntısı
    if (this.necromancer?.sprite) {
      this.necromancer.sprite.setTintFill(0xff3333);
      this.time.delayedCall(90, () => this.necromancer?.sprite?.clearTint());
    }
    if (CONFIG.FX?.screenShake) this.cameras.main.shake(120, 0.006);
    this.game.events.emit('sfx', 'uiDenied');
    if (n.hp <= 0) this._onNecromancerDeath();
  }

  /** Necromancer öldü — koşu biter (K26). Faz F'de zorlanmış prestige (yarı çarpan) bağlanacak. */
  /** Necromancer öldü → ZORLANMIŞ prestige (yarı çarpan, Diş-1 — K14/K26). */
  _onNecromancerDeath() {
    if (this.isGameOver) return;
    const result = PrestigeManager.forcedPrestige();
    this._showRunEndScreen(false, result);
  }

  /** Tanrı yenildi → GÖNÜLLÜ prestige (tam çarpan, zafer — K26). */
  _onGodDefeated() {
    if (this.isGameOver) return;
    const result = PrestigeManager.voluntaryPrestige();
    this._showRunEndScreen(true, result);
  }

  /**
   * Koşu-sonu ekranı (ölüm veya zafer). Prestige zaten uygulandı (result taşır).
   * @param {boolean} isVictory
   * @param {{gain:number,newMultiplier:number,depth:number}} result
   */
  _showRunEndScreen(isVictory, result) {
    this.isGameOver = true;
    GameState.necromancer.hp = GameState.necromancer.maxHp;
    SaveManager.save();
    this.game.events.emit('sfx', isVictory ? 'prestige' : 'deathDefender');
    if (CONFIG.FX?.screenShake) this.cameras.main.shake(500, isVictory ? 0.01 : 0.02);

    const cx = CONFIG.CANVAS_WIDTH / 2, cy = CONFIG.CANVAS_HEIGHT / 2;
    const accent = isVictory ? 0xffd700 : 0xff4444;
    const accentHex = isVictory ? '#ffd700' : '#ff4444';
    const overlay = this.add.rectangle(cx, cy, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, isVictory ? 0x0a0a2a : 0x000000, 0).setDepth(400);
    this.tweens.add({ targets: overlay, fillAlpha: 0.82, duration: 500 });

    const title = this.add.text(cx, cy - 56, i18n(isVictory ? 'game.victoryTitle' : 'game.gameOverTitle'), {
      fontSize: '30px', fontFamily: 'monospace', color: accentHex, stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(401).setAlpha(0);
    const sub = this.add.text(cx, cy - 20, i18n(isVictory ? 'game.victorySub' : 'game.gameOverSub', { wave: GameState.wave.current, floor: result.depth }), {
      fontSize: '13px', fontFamily: 'monospace', color: '#cccccc', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(401).setAlpha(0);
    // Kazanılan çarpan (Model Y — her iki yolda da, zorlanmışta yarı)
    const mult = this.add.text(cx, cy + 10, i18n('game.prestigeGain', { gain: result.gain.toFixed(2), total: result.newMultiplier.toFixed(2) }), {
      fontSize: '15px', fontFamily: 'monospace', color: '#c9b3ff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(401).setAlpha(0);

    const btn = this.add.rectangle(cx, cy + 54, 180, 36, isVictory ? 0x1a3a1a : 0x3a1a1a).setDepth(401).setStrokeStyle(2, accent).setAlpha(0).setInteractive({ useHandCursor: true });
    const btnLabel = this.add.text(cx, cy + 54, i18n(isVictory ? 'game.descendAgain' : 'game.restart'), {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffffff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(402).setAlpha(0);
    this.tweens.add({ targets: [title, sub, mult, btn, btnLabel], alpha: 1, duration: 500, delay: 300 });
    btn.on('pointerover', () => btn.setFillStyle(isVictory ? 0x2a5a2a : 0x5a2a2a));
    btn.on('pointerout', () => btn.setFillStyle(isVictory ? 0x1a3a1a : 0x3a1a1a));
    btn.on('pointerdown', () => {
      // Prestige zaten uygulandı; yeni koşu Kat 1'den başlar (çarpan kalıcı)
      SaveManager.save();
      this.scene.stop('UIScene');
      this.scene.restart();
    });
  }

  /** Yapışkan hedef işareti (K25) — tıklanan düşmanın üstünde kısa görsel. */
  _showTargetMarker(enemy) {
    if (!enemy?.sprite) return;
    const m = this.add.text(enemy.sprite.x, enemy.sprite.y - 24, '🎯', { fontSize: '18px' }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: m, y: m.y - 10, alpha: 0, duration: 700, onComplete: () => m.destroy() });
  }

  /** UIScene "Ör & Yerleştir" dedi: en son eklenen bu tip birimi yerleştirme moduna al (K36). */
  onStartPlacement(data) {
    const type = data.type;
    const list = this._unitListFor(type);
    if (!list || list.length === 0) return;
    const unit = list[list.length - 1]; // syncDefenders'ın yeni eklediği
    this._placing = { type, unit };
    // Önizleme: birimi fareye bağla, yarı saydam
    if (unit.sprite) unit.sprite.setAlpha(0.5);
    if (!this._placeHint) {
      this._placeHint = this.add.text(CONFIG.CANVAS_WIDTH / 2, CONFIG.CORRIDOR_TOP + 8,
        i18n('game.placementHint'), { fontSize: '12px', fontFamily: 'monospace', color: '#00ffff', stroke:'#000', strokeThickness:3 }
      ).setOrigin(0.5).setDepth(200);
    }
    this._placeHint.setVisible(true);
  }

  /** type → ilgili birim listesi. */
  _unitListFor(type) {
    return this.defenders[type] || null;
  }

  /** Yerleştirmeyi bitir: birimi tıklanan çıpaya koy. */
  _commitPlacement(x, y) {
    const u = this._placing.unit;
    u.anchorX = x; u.anchorY = y;
    if (u.sprite) u.sprite.setAlpha(1);
    // ranged anında kayar; melee yürür
    if (u.combatType === 'ranged') {
      this.tweens.add({ targets: u, x, y, duration: 300, ease: 'Sine.easeInOut',
        onUpdate: () => u.sprite?.setPosition(u.x, u.y) });
    }
    this._placing = null;
    if (this._placeHint) this._placeHint.setVisible(false);
    this.game.events.emit('sfx', 'hire');
  }

  /** Bir birimi seç (taşımaya hazırla) — K24 serbest yerleştirme. */
  _selectUnit(unit) {
    this._selectedUnit = unit;
    if (!this._selectRing) {
      this._selectRing = this.add.circle(unit.x, unit.y, 18, 0x00ffff, 0).setStrokeStyle(2, 0x00ffff, 0.9).setDepth(16);
    }
    this._selectRing.setPosition(unit.x, unit.y).setVisible(true);
    this.showFloatingText(i18n('game.unitSelected'), unit.x, unit.y - 24, 0x00ffff, 11, 900);
  }

  /** Seçili birimin çıpasını yeni konuma taşı (yürüyerek gider — K24). */
  _moveUnitAnchor(unit, x, y) {
    unit.anchorX = x;
    unit.anchorY = y;
    // ranged anında yeni çıpaya kayar; melee zaten lunge/return ile yürür
    if (unit.combatType === 'ranged') {
      this.tweens.add({ targets: unit, x, y, duration: 300, ease: 'Sine.easeInOut',
        onUpdate: () => unit.sprite?.setPosition(unit.x, unit.y) });
    }
    this._selectedUnit = null;
    if (this._selectRing) this._selectRing.setVisible(false);
    this.game.events.emit('sfx', 'mapOpen');
  }

  /** Tüm dizilebilir birimlerin HP barlarını çiz (her frame — update'ten çağrılır). */
  _drawUnitHpBars() {
    if (!this._unitHpGfx) this._unitHpGfx = this.add.graphics().setDepth(12);
    const g = this._unitHpGfx;
    g.clear();
    for (const u of this.getAllUnits()) {
      if (!u.alive || !u.sprite || u.hp >= u.maxHp) continue; // tam canda bar gizli
      const w = 18, h = 3;
      const bx = u.x - w / 2, by = u.y - 18;
      g.fillStyle(0x333333, 0.8); g.fillRect(bx, by, w, h);
      const ratio = Math.max(0, u.hp / u.maxHp);
      g.fillStyle(ratio > 0.3 ? 0x66ccff : 0xff5555, 1); // birim HP: buz mavisi (iskelet)
      g.fillRect(bx, by, w * ratio, h);
    }
    // seçim halkası birimi takip etsin
    if (this._selectedUnit && this._selectedUnit.alive && this._selectRing) {
      this._selectRing.setPosition(this._selectedUnit.x, this._selectedUnit.y);
    }
  }

  /** Dev panel: belirli bir wave'e atla. */
  onDevJumpWave(n) {
    const wave = Math.max(1, Math.floor(n) || 1);
    GameState.wave.current = wave;
    if (this.waveManager) {
      this.waveManager.clearAll();
      this.waveManager.calculateWaveEnemies();
    }
    this.showFloatingText(i18n('game.nextWave', { n: wave }), CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 30, 0x00ffff, 22, 1200);
  }

  showFloatingText(text, x, y, color = 0xffffff, size = 14, duration = 800) {
    const t = this.add.text(x, y, text, {
      fontSize: `${size}px`, fontFamily: 'monospace',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(50).setAlpha(1).setScale(0.4);

    // Pop: hızlı yaylanarak büyü
    this.tweens.add({ targets: t, scaleX: 1, scaleY: 1, duration: 160, ease: 'Back.easeOut' });
    // Yüksel + solup kaybol
    this.tweens.add({
      targets: t, y: y - 30, alpha: 0, duration,
      ease: 'Power1',
      onComplete: () => t.destroy(),
    });
  }

  updateFloatingTexts(_delta) {
    // Tweens yönetiyor, ekstra bir şeye gerek yok
  }
}
