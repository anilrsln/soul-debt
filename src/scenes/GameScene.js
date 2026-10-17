import { CONFIG } from '../config.js';
import GameState, { resetForPrestige } from '../state/GameState.js';
import WaveManager from '../systems/WaveManager.js';
import IdleManager from '../systems/IdleManager.js';
import SaveManager from '../systems/SaveManager.js';
import AchievementManager from '../systems/AchievementManager.js';
import Necromancer from '../entities/Necromancer.js';
import Archer from '../entities/Archer.js';
import Cannon from '../entities/Cannon.js';
import FrostTower from '../entities/FrostTower.js';
import Catapult from '../entities/Catapult.js';
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
    });

    AssetProvider.createAnims(this);
    this.drawBackground();
    this.drawWall();
    this.drawLanes();

    // Necromancer — başlangıç birimi (K25), hep sahnede, sabit konum
    this.necromancer = new Necromancer(this, CONFIG.WALL_X + 40, Math.round((CONFIG.CORRIDOR_TOP + CONFIG.CORRIDOR_BOTTOM) / 2));
    this.isGameOver = false;
    // Necromancer canını başlat (yeni oyun) — yüklenen save applyLoad'da üzerine yazar
    if (GameState.necromancer.hp == null || GameState.necromancer.hp <= 0) {
      GameState.necromancer.hp = GameState.necromancer.maxHp;
    }

    // Yapışkan hedefleme (K25): sahaya tık → en yakın düşmanı necromancer'a yapışkan hedef yap
    this.input.on('pointerdown', (pointer) => {
      if (this.isGameOver) return;
      const enemies = this.waveManager?.enemies || [];
      let nearest = null, nd = Infinity;
      for (const e of enemies) {
        if (!e.alive || e.dying || !e.sprite) continue;
        const dx = e.sprite.x - pointer.worldX, dy = e.sprite.y - pointer.worldY;
        const d = dx * dx + dy * dy;
        if (d < nd) { nd = d; nearest = e; }
      }
      // yalnız makul yakınlıktaki tıkları hedef kabul et (40px)
      if (nearest && nd <= 40 * 40) {
        this.necromancer.setStickyTarget(nearest);
        this._showTargetMarker(nearest);
      }
    });
    this.archers = [];
    this.cannons = [];
    this.frostTowers = [];
    this.catapults = [];

    // Dalga yöneticisi
    this.waveManager = new WaveManager(this);

    // Floating text listesi
    this.floatingTexts = [];

    // Event dinleyicileri
    this.events.on('enemy-killed', this.onEnemyKilled, this);
    this.events.on('wave-complete', this.onWaveComplete, this);
    this.events.on('boss-wave', this.onBossWave, this);

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


  drawLanes() {
    const g = this.add.graphics().setDepth(1);
    const corridorTop = CONFIG.CORRIDOR_TOP;
    const corridorBottom = CONFIG.CORRIDOR_BOTTOM;
    const laneCount = CONFIG.LANE_COUNT;
    const laneSpacing = (corridorBottom - corridorTop) / laneCount;

    g.lineStyle(1, CONFIG.COLORS.GROUND_LIGHT, 0.25);
    for (let i = 0; i <= laneCount; i++) {
      const y = corridorTop + laneSpacing * i;
      g.lineBetween(0, y, CONFIG.CANVAS_WIDTH, y);
    }
  }

  // ═══════════════ Güncelleme ═══════════════
  update(time, deltaMs) {
    if (this.isGameOver) return; // koşu bitti — simülasyon durur (K26 ölüm)
    // Oyun hızı çarpanı (dev panel) — tüm simülasyona uygulanır
    const delta = (deltaMs / 1000) * (CONFIG.DEBUG?.timeScale ?? 1);

    // Dalga yöneticisi
    this.waveManager.update(delta);

    // Tüm düşmanlar listesi
    const enemies = this.waveManager.enemies;

    // Necromancer (her zaman aktif)
    this.necromancer.update(delta, enemies);

    // Archers
    this.syncDefenders('archer', this.archers, Archer);
    for (const a of this.archers) a.update(delta, enemies);

    // Cannons
    this.syncDefenders('cannon', this.cannons, Cannon);
    for (const c of this.cannons) c.update(delta, enemies);

    // Frost Towers
    this.syncDefenders('frost', this.frostTowers, FrostTower);
    for (const f of this.frostTowers) f.update(delta, enemies);

    // Catapults
    this.syncDefenders('catapult', this.catapults, Catapult);
    for (const ct of this.catapults) ct.update(delta, enemies);

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

  /** Savunucu sayısını GameState ile senkronize eder. */
  syncDefenders(type, list, DefenderClass) {
    const state = GameState.defenders[type];
    const targetCount = state.count || 0;

    while (list.length < targetCount) {
      const idx = list.length;
      const corridorTop = CONFIG.CORRIDOR_TOP;
      const corridorBottom = CONFIG.CORRIDOR_BOTTOM;
      const laneCount = CONFIG.LANE_COUNT;
      // Kolon x'leri: archer duvarda, diger tipler surun arkasinda
      // Archer: sur ustunde | Cannon/Frost/Catapult: surun solunda (kale arkasi)
      const colX = { archer: CONFIG.WALL_X, cannon: 118, frost: 68, catapult: 28 };
      const x = colX[type] ?? (CONFIG.DEFENDER_X + 15);
      const laneSpacing = (corridorBottom - corridorTop) / laneCount;
      let y;
      if (type === 'catapult') {
        // Catapult: lane araları 2.5 ve 3.5 (şeritlerin tam ortasında, simetrik)
        const catapultLanes = [2.5, 3.5];
        const lanePos = catapultLanes[idx % catapultLanes.length] ?? 2.5;
        y = corridorTop + laneSpacing * lanePos;
      } else {
        // Diğerleri: ortadan köşeye açılan sıra (0→orta, 1→orta-1, 2→orta+1, ...)
        const midLane = Math.floor(laneCount / 2);
        const offsets = [0, -1, 1, -2, 2, -3, 3];
        const laneIdx = midLane + (offsets[idx] ?? idx);
        const clampedLane = Phaser.Math.Clamp(laneIdx, 0, laneCount - 1);
        y = corridorTop + laneSpacing * (clampedLane + 0.5);
      }
      list.push(new DefenderClass(this, x, y, idx));
    }

    while (list.length > targetCount) {
      const removed = list.pop();
      removed.destroy();
    }
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
    if (CONFIG.FX?.screenShake && (data.type === 'elite' || data.type === 'boss')) {
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

  /** Boss dalgası girişinde duyuru. */
  onBossWave(data) {
    const bossName = data.bossType ? i18n(`enemy.${data.bossType}`) : i18n('game.boss');
    this.showFloatingText(i18n('game.bossWave', { boss: bossName, wave: data.wave }), CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 50, 0xff4444, 24, 2000);
    this.game.events.emit('sfx', 'prestige');
  }

  /** Basit ölüm parçacık efekti. */
  spawnDeathParticles(x, y, killedBy) {
    const color = killedBy === 'breach' ? 0xcc3333 : 0xffffff;
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
    const list = type === 'laser' ? [this.necromancer]
      : type === 'archer' ? this.archers
      : type === 'cannon' ? this.cannons : [];
    for (const d of list) {
      if (!d || !d.sprite) continue;
      this.tweens.add({
        targets: d.sprite, scaleX: 1.35, scaleY: 1.35,
        duration: 110, yoyo: true, ease: 'Quad.easeOut',
      });
    }
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
  _onNecromancerDeath() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    SaveManager.save();
    this.game.events.emit('sfx', 'deathDefender');
    if (CONFIG.FX?.screenShake) this.cameras.main.shake(500, 0.02);

    const cx = CONFIG.CANVAS_WIDTH / 2, cy = CONFIG.CANVAS_HEIGHT / 2;
    const overlay = this.add.rectangle(cx, cy, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, 0x000000, 0).setDepth(400);
    this.tweens.add({ targets: overlay, fillAlpha: 0.78, duration: 500 });
    const title = this.add.text(cx, cy - 40, i18n('game.gameOverTitle'), {
      fontSize: '32px', fontFamily: 'monospace', color: '#ff4444', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(401).setAlpha(0);
    const sub = this.add.text(cx, cy + 4, i18n('game.gameOverSub', { wave: GameState.wave.current }), {
      fontSize: '14px', fontFamily: 'monospace', color: '#cccccc', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(401).setAlpha(0);
    // Placeholder: yeniden başla butonu (Faz F'de prestige/çarpan ekranına dönüşecek)
    const btn = this.add.rectangle(cx, cy + 56, 160, 36, 0x3a1a1a).setDepth(401).setStrokeStyle(2, 0xff4444).setAlpha(0).setInteractive({ useHandCursor: true });
    const btnLabel = this.add.text(cx, cy + 56, i18n('game.restart'), {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffffff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(402).setAlpha(0);
    this.tweens.add({ targets: [title, sub, btn, btnLabel], alpha: 1, duration: 500, delay: 300 });
    btn.on('pointerover', () => btn.setFillStyle(0x5a2a2a));
    btn.on('pointerout', () => btn.setFillStyle(0x3a1a1a));
    btn.on('pointerdown', () => {
      // Placeholder reset: koşu-içi sıfırla (prestige çarpanı Faz F'de uygulanacak)
      resetForPrestige(GameState);
      GameState.necromancer.hp = GameState.necromancer.maxHp;
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
