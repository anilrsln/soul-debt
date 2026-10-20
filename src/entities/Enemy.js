import { CONFIG } from '../config.js';
import GameState from '../state/GameState.js';
import { calculateEnemyHP, calculateEnemySoul } from '../utils/MathUtils.js';
import ConquestManager from '../systems/ConquestManager.js';
import EconomyManager from '../systems/EconomyManager.js';
import AssetProvider from '../systems/AssetProvider.js';
import SoulDebtManager from '../systems/SoulDebtManager.js';
import VeteranManager from '../systems/VeteranManager.js';

/** Enemy — Sağdan spawn, sola yürü, hat ihlali veya savunucu ölümü. */
export default class Enemy {
  constructor(scene, type, waveNumber, laneY, options = {}) {
    // Pool sözleşmesi: tüm kurulum reset()'te; constructor tek yol kullanır.
    this.reset(scene, type, waveNumber, laneY, options);
  }

  /**
   * Bir Enemy örneğini (yeni veya havuzdan) kullanıma hazırlar.
   * TÜM instance state'i burada set/sıfırlanır — havuzdan dönen nesnede
   * önceki dalganın durumu sızmasın diye her alan açıkça yazılır.
   */
  reset(scene, type, waveNumber, laneY, options = {}) {
    this.scene = scene;
    this.type = type;
    this.alive = true;
    this.dying = false;
    this._wave = waveNumber;

    // Geçici davranış state'ini açıkça temizle (havuz güvenliği)
    this._slowTimer = undefined;
    this._baseSpeed = undefined;
    this._healTimer = undefined;
    this._flashing = false;
    this._shieldBroken = false;

    const config = CONFIG.ENEMIES[type];
    this.name = config.name;
    this.speed = config.speed;

    // Spawn seçenekleri (splitter çocukları için): küçük/zayıf, bölünmez, kotaya sayılmaz
    const hpFactor = options.hpFactor ?? 1;
    const rewardFactor = options.rewardFactor ?? 1;
    this.isChild = options.child ?? false;
    this.noSplit = options.noSplit ?? false;
    this.splitConfig = config.split || null;
    this.healConfig = config.heal || null; // yakındaki düşmanları iyileştirir
    this.rageConfig  = config.rage  || null; // boss_berserker: hasar aldıkça hızlanır

    this.metaReward = (config.meta ?? 0) * rewardFactor;
    this.metaType = config.metaType ?? 'bone'; // bone/essence/crystal (K3)
    this.maxHP = Math.max(1, Math.floor(calculateEnemyHP(config.hp, CONFIG.WAVES.hpScaling, waveNumber) * hpFactor));
    this.currentHP = this.maxHP;
    this.soulReward = calculateEnemySoul(config.soul, CONFIG.WAVES.soulScaling, waveNumber) * rewardFactor;

    // Davranış: kalkan (opsiyonel). config.shield varsa ilk darbeleri emer;
    // HP ile aynı eğride ölçeklenir. (Veri-güdümlü davranış deseni — yeni
    // davranışlar config alanı + burada kısa bir kontrol olarak eklenir.)
    this.maxShield = config.shield ? calculateEnemyHP(config.shield, CONFIG.WAVES.hpScaling, waveNumber) : 0;
    this.currentShield = this.maxShield;
    this._shieldBroken = false;

    const spawnX = options.spawnX ?? CONFIG.SPAWN_X;
    const childScale = options.scale ?? 1;
    // Sprite: havuzdan dönen nesnede var olanı yeniden kullan, yoksa yarat.
    if (this.sprite) {
      scene.tweens.killTweensOf(this.sprite);       // uçan ölüm/alpha tween'lerini durdur
      this.sprite.clearTint();
      this.sprite.setPosition(spawnX, laneY).setDepth(10).setAlpha(0)
        .setScale(1).setActive(true).setVisible(true).setRotation(0);
      this.sprite.setTexture(`enemy-${type}`);
    } else {
      this.sprite = scene.add.sprite(spawnX, laneY, `enemy-${type}`).setDepth(10).setAlpha(0);
    }
    this._animKey = `enemy-${type}`;
    this._animState = 'walk';       // düşmanlar varsayılan yürür (sheet'te walk yoksa idle'a düşer)
    this._animOverride = null;      // tek-sefer anim (attack/hurt/death)
    AssetProvider.applySprite(this.sprite, this._animKey, childScale);
    AssetProvider.playAnim(this.sprite, this._animKey, 'walk');
    scene.tweens.add({ targets: this.sprite, alpha: 1, duration: 200 });

    // Boss: daha geniş ve sürekli görünen HP bar
    this.hpBarWidth = options.boss ? 60 : 20;
    this.hpBarHeight = options.boss ? 5 : 3;
    this._barYOffset = options.boss ? 34 : 14;
    this.alwaysShowBar = options.boss ?? false;
    if (this.hpBar) { this.hpBar.clear(); this.hpBar.setActive(true).setVisible(true); }
    else this.hpBar = scene.add.graphics().setDepth(11);
  }

  /** Havuza dönerken: sprite/hpBar'ı pasifleştir (yok etme). */
  sleep() {
    if (this.sprite) {
      this.scene?.tweens?.killTweensOf(this.sprite);
      this.sprite.clearTint();
      this.sprite.setActive(false).setVisible(false);
    }
    if (this.hpBar) { this.hpBar.clear(); this.hpBar.setActive(false).setVisible(false); }
    this.alive = false;
    this.dying = false;
  }

  /** Sahne kapanışı: gerçek yıkım. */
  hardDestroy() {
    this.sprite?.destroy(); this.sprite = null;
    this.hpBar?.destroy();  this.hpBar = null;
  }

  /** Tek-sefer animasyon tetikle (attack/hurt). death ayrı (dieToDefender). */
  _triggerAnim(state, durationSec) {
    this._animOverride = { state, timer: durationSec };
  }

  /** Her frame: override varsa onu, yoksa logicState'i oynat. Sheet'te state yoksa idle/ilk'e düşer. */
  _tickAnim(delta, logicState) {
    if (!this.sprite) return;
    let state = logicState;
    if (this._animOverride) {
      this._animOverride.timer -= delta;
      if (this._animOverride.timer > 0) state = this._animOverride.state;
      else this._animOverride = null;
    }
    this._animState = state;
    AssetProvider.playAnim(this.sprite, this._animKey, state);
  }

  update(delta, enemies) {
    if (!this.alive || this.dying) return;
    // Yavaşlatma debuff süresi bitti mi?
    if (this._slowTimer !== undefined) {
      this._slowTimer -= delta;
      if (this._slowTimer <= 0) {
        this._slowTimer = undefined;
        if (this._baseSpeed !== undefined) { this.speed = this._baseSpeed; this._baseSpeed = undefined; }
        if (this.sprite) this.sprite.clearTint();
      }
    }
    // Dur-dövüş (K8/K34): yoluna çıkan ilk MELEE tıkaça temas edince dur, karşılıklı HP tüket.
    const blocker = this._findBlocker();
    if (blocker) {
      this._engagedBy = blocker;
      this._attackTimer = (this._attackTimer ?? 0) - delta;
      if (this._attackTimer <= 0) {
        this._attackTimer = 1 / CONFIG.COMBAT.enemyAttackRate;
        const dmg = Math.max(1, Math.floor(this._attackPower()));
        blocker.takeDamage(dmg);
        this._triggerAnim('attack', 0.3); // tıkaça vuruş → attack animasyonu
      }
      this.updateHPBar();
      if (this.healConfig && enemies) this._updateHeal(delta, enemies);
      this._tickAnim(delta, 'idle'); // dövüşürken yerinde (attack override vuruşta biner)
      return; // dövüşürken ilerlemez
    }
    this._engagedBy = null;

    // Önü açık: necromancer'a doğru ilerle (sola)
    this.sprite.x -= this.speed * delta;
    this.updateHPBar();
    if (this.healConfig && enemies) this._updateHeal(delta, enemies);
    this._tickAnim(delta, 'walk'); // ilerliyor → walk
    // Hat ihlali: hiçbir birime takılmadan sur hattını geçerse necromancer'a ulaşır (K13)
    if (this.sprite.x <= CONFIG.WALL_X - 14) { this.breachLine(); return; }
  }

  /** Yoluna çıkan ilk melee tıkaç (temas mesafesinde, önünde). K34. */
  _findBlocker() {
    const blockers = this.scene.getMeleeBlockers?.();
    if (!blockers || blockers.length === 0) return null;
    const r = CONFIG.COMBAT.meleeRange;
    const ex = this.sprite.x, ey = this.sprite.y;
    let best = null, bestDist = Infinity;
    for (const b of blockers) {
      if (!b.alive || !b.sprite) continue;
      const dx = b.x - ex, dy = b.y - ey;
      const d2 = dx * dx + dy * dy;
      // temas yarıçapı içinde + en yakını (düşman sola gittiği için "yoluna çıkan" ~ en yakın blokçu)
      if (d2 <= r * r && d2 < bestDist) { bestDist = d2; best = b; }
    }
    return best;
  }

  /** Düşmanın melee vuruş gücü (HP tabanlı placeholder; Faz G'de config'e taşınır). */
  _attackPower() {
    const base = CONFIG.ENEMIES[this.type]?.soul ?? 2;
    return Math.max(2, base * 1.2); // güçlü düşman daha sert vurur
  }

  /** Healer: periyodik olarak menzildeki (kendisi hariç) düşmanların HP'sini yeniler.
   *  radius === 0 ise yalnızca kendini iyileştirir (boss_shaman self-heal). */
  _updateHeal(delta, enemies) {
    this._healTimer = (this._healTimer ?? this.healConfig.interval) - delta;
    if (this._healTimer > 0) return;
    this._healTimer = this.healConfig.interval;

    const selfOnly = this.healConfig.radius === 0;

    if (selfOnly) {
      // Self-heal: sadece kendi HP'sini yenile
      if (this.currentHP < this.maxHP) {
        const amt = Math.max(1, Math.floor(this.maxHP * this.healConfig.fraction));
        this.currentHP = Math.min(this.maxHP, this.currentHP + amt);
        this.updateHPBar();
        this._healFlash();
        this._healPulse();
      }
      return;
    }

    const r2 = this.healConfig.radius * this.healConfig.radius;
    let healedAny = false;
    for (const e of enemies) {
      if (e === this || !e.alive || e.dying || !e.sprite) continue;
      if (e.currentHP >= e.maxHP) continue;
      const dx = e.sprite.x - this.sprite.x;
      const dy = e.sprite.y - this.sprite.y;
      if (dx * dx + dy * dy > r2) continue;
      const amt = Math.max(1, Math.floor(e.maxHP * this.healConfig.fraction));
      e.currentHP = Math.min(e.maxHP, e.currentHP + amt);
      e.updateHPBar();
      e._healFlash();
      healedAny = true;
    }
    if (healedAny) this._healPulse();
  }

  /** İyileşen hedefte kısa yeşil flash. */
  _healFlash() {
    if (!this.sprite || this._flashing) return;
    this.sprite.setTintFill(0x44ff88);
    this.scene.time.delayedCall(80, () => { if (this.sprite) this.sprite.clearTint(); });
  }

  /** Healer'dan yayılan yeşil aura halkası. */
  _healPulse() {
    if (!this.sprite) return;
    const ring = this.scene.add.circle(this.sprite.x, this.sprite.y, this.healConfig.radius * 0.4, 0x44ff88, 0.18).setDepth(9);
    this.scene.tweens.add({
      targets: ring, scaleX: 2.2, scaleY: 2.2, alpha: 0, duration: 420, ease: 'Power2',
      onComplete: () => ring.destroy(),
    });
  }

  takeDamage(amount, flash = true, isCrit = false) {
    if (!this.alive || this.dying) return false;
    // Kalkan varsa önce onu emer, kalan hasar HP'ye geçer
    if (this.currentShield > 0) {
      const absorbed = Math.min(this.currentShield, amount);
      this.currentShield -= absorbed;
      amount -= absorbed;
      if (this.currentShield <= 0 && !this._shieldBroken) {
        this._shieldBroken = true;
        this._onShieldBreak();
      }
    }
    if (amount > 0) this.currentHP -= amount;
    // Rage mekaniği: boss_berserker hasar aldıkça hızlanır
    if (amount > 0 && this.rageConfig && this.alive) {
      const rc = this.rageConfig;
      if (this._baseSpeed === undefined) this._baseSpeed = this.speed; // ilk kez kaydet
      const maxSpeed = this._baseSpeed * rc.maxMultiplier;
      if (this.speed < maxSpeed) {
        this.speed = Math.min(maxSpeed, this.speed + this._baseSpeed * rc.speedGainFraction);
        // Giderek kızaran tint: beyazdan kırmızıya
        if (this.sprite) {
          const t = Math.min(1, (this.speed - this._baseSpeed) / (maxSpeed - this._baseSpeed));
          const r = 255;
          const gb = Math.floor(255 * (1 - t));
          this.sprite.setTint(Phaser.Display.Color.GetColor(r, gb, gb));
        }
      }
    }
    this.updateHPBar();
    // Kritik vuruş: turuncu flash + "CRIT" bildirimi
    if (isCrit && this.sprite) {
      this._critFlash();
      this.scene.game.events.emit('crit-hit', { x: this.sprite.x, y: this.sprite.y, damage: Math.floor(amount) });
    }
    if (this.currentHP <= 0) { this.currentHP = 0; this.dieToDefender(); return true; }
    if (flash && !isCrit) this._flash();
    this._triggerAnim('hurt', 0.15); // kısa sarsılma (sheet'te hurt yoksa mevcut state'e düşer)
    return false;
  }

  /** Kritik vuruşta turuncu flash. */
  _critFlash() {
    if (!this.sprite) return;
    this.sprite.setTintFill(0xff8800);
    this.scene.time.delayedCall(70, () => { if (this.sprite) this.sprite.clearTint(); });
  }

  /** Kalkan kırıldığında kısa cyan flash. */
  _onShieldBreak() {
    if (!this.sprite) return;
    this.sprite.setTintFill(0x66ccff);
    this.scene.time.delayedCall(90, () => { if (this.sprite) this.sprite.clearTint(); });
  }

  /** Kısa beyaz isabet flash'ı (mermiler için; lazer sürekli olduğundan çağırmaz). */
  _flash() {
    if (!this.sprite || this._flashing || !CONFIG.FX?.hitFlash) return;
    this._flashing = true;
    this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(55, () => {
      if (this.sprite) this.sprite.clearTint();
      this._flashing = false;
    });
  }

  dieToDefender() {
    if (this.dying) return;
    this.dying = true; this.alive = false;
    const dbg = CONFIG.DEBUG?.gainMultiplier ?? 1;
    const soulMult = GameState.prestige.multiplier * ConquestManager.getEconomyMultiplier('soulMultiplier') * dbg * EconomyManager.getEconomyBoostMultiplier('soulBoost');
    const metaMult = GameState.prestige.multiplier * ConquestManager.getEconomyMultiplier('metaMultiplier') * dbg * EconomyManager.getEconomyBoostMultiplier('metaBoost');
    const soul = this.soulReward * soulMult;
    const meta = this.metaReward * metaMult;
    this._grantRewards(soul, meta, 'defender');
    // TANRI yenildi → ZAFER akışı (K26, gönüllü prestige)
    if (this.isGod) {
      this.scene.events.emit('god-defeated', { wave: this._wave });
    }
    // Splitter: savunucu ile ölünce küçük çocuklara bölünür (hat ihlalinde bölünmez)
    if (this.splitConfig && !this.noSplit) {
      const sc = this.splitConfig;
      this.scene.game.events.emit('enemy-split', {
        x: this.sprite.x, y: this.sprite.y, wave: this._wave,
        count: sc.count, hpFactor: sc.hpFactor, rewardFactor: sc.rewardFactor, scale: sc.scale,
      });
    }
    this.sprite.setTint(0xffffff);
    this._animOverride = null;
    // Death animasyonu varsa onu oynat, bitince sön; yoksa eski scale+fade.
    const hasDeath = AssetProvider.hasState(this._animKey, 'death');
    if (hasDeath) {
      this.sprite.clearTint();
      AssetProvider.playAnim(this.sprite, this._animKey, 'death');
      this.scene.tweens.add({
        targets: this.sprite, alpha: 0, duration: 450, delay: 200, ease: 'Power1',
        onComplete: () => { this.dying = false; },
      });
    } else {
      this.scene.tweens.add({
        targets: this.sprite, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 300, ease: 'Power2',
        onComplete: () => { this.dying = false; }, // release: WaveManager havuza döndürür
      });
    }
    this.hpBar.clear();
  }

  /** Hat ihlali — düşman hattı geçip necromancer'a ulaştı (K13).
   *  Faz C: necromancer'ın canından sabit breachDamage keser (necromancer bir can havuzu,
   *  düşmanla bire bir dövüşmez — bir ısırık alır ve yok olur). Düşman-orantılı hasar (K12)
   *  + soul-debt (K11) Faz D'de eklenecek. Ödül verilmez (hattı aşan düşman ezilmiş sayılmaz). */
  breachLine() {
    if (this.dying) return;
    this.dying = true; this.alive = false;
    // Necromancer can havuzundan sabit kesinti (GameScene merkezi yönetir)
    this.scene.damageNecromancer?.(CONFIG.NECROMANCER.breachDamage);
    // wave kotasına sayılır (spawn edildi), ama ödül verilmez
    if (!this.isChild) GameState.wave.enemiesKilled++;
    GameState.stats.totalEnemiesKilled++;
    this.scene.events.emit('enemy-killed', {
      type: this.type, soul: 0, meta: 0,
      x: this.sprite.x, y: this.sprite.y, killedBy: 'breach',
    });
    this.scene.game.events.emit('sfx', 'deathDefender');
    this.hpBar.clear();
    this.scene.tweens.add({
      targets: this.sprite, alpha: 0, scaleX: 0.5, scaleY: 0.5, duration: 250, ease: 'Power2',
      onComplete: () => { this.dying = false; }, // release: WaveManager havuza döndürür
    });
  }

  _grantRewards(soul, meta, killedBy) {
    GameState.resources.soul += soul;
    GameState.lifetimeSoul += soul; // onboarding tetiği (K19)
    GameState.resources[this.metaType] = (GameState.resources[this.metaType] || 0) + meta; // tipe göre meta (K3)
    if (!this.isChild) GameState.wave.enemiesKilled++; // çocuklar wave kotasına sayılmaz
    GameState.stats.totalEnemiesKilled++;
    GameState.stats.totalSoulEarned += soul;
    GameState.stats.totalMetaEarned += meta;
    if (this.type === 'boss') GameState.stats.bossesKilled++;
    // Düşman öldürmek soul-debt'i azaltır ("ruh hasat ederek borç öde" — K33)
    SoulDebtManager.onEnemyKilled();
    // Kazanılan soul sahadaki canlı birimlere kıdem olarak eşit pay edilir (K37, paralel sayaç)
    VeteranManager.distribute(soul);
    this.scene.events.emit('enemy-killed', {
      type: this.type, soul, meta,
      x: this.sprite.x, y: this.sprite.y, killedBy,
    });
    this.scene.game.events.emit('sfx', 'deathDefender');
  }

  updateHPBar() {
    this.hpBar.clear();
    if (!this.alive || !this.sprite) return;
    const hasShield = this.maxShield > 0 && this.currentShield > 0;
    // Tam can ve kalkan yoksa barı gizle (boss her zaman gösterir)
    if (!hasShield && this.currentHP >= this.maxHP && !this.alwaysShowBar) return;

    const bx = this.sprite.x - this.hpBarWidth / 2;
    let by = this.sprite.y - (this._barYOffset ?? 14);

    // Kalkan barı (üstte, cyan)
    if (hasShield) {
      this.hpBar.fillStyle(CONFIG.COLORS.HP_BAR_BG, 0.8);
      this.hpBar.fillRect(bx, by, this.hpBarWidth, this.hpBarHeight);
      this.hpBar.fillStyle(0x66ccff, 1);
      this.hpBar.fillRect(bx, by, this.hpBarWidth * (this.currentShield / this.maxShield), this.hpBarHeight);
      by += this.hpBarHeight + 1;
    }

    // HP barı
    this.hpBar.fillStyle(CONFIG.COLORS.HP_BAR_BG, 0.8);
    this.hpBar.fillRect(bx, by, this.hpBarWidth, this.hpBarHeight);
    const ratio = Math.max(0, this.currentHP / this.maxHP);
    this.hpBar.fillStyle(ratio > 0.3 ? CONFIG.COLORS.HP_BAR_FILL : CONFIG.COLORS.HP_BAR_LOW, 1);
    this.hpBar.fillRect(bx, by, this.hpBarWidth * ratio, this.hpBarHeight);
  }

  /** Geriye dönük uyumluluk: doğrudan yıkım isteyen çağrılar için hardDestroy'a eşle. */
  destroy() {
    this.hardDestroy();
  }
}
