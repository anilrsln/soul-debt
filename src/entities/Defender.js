import { CONFIG } from '../config.js';
import GameState from '../state/GameState.js';
import { calculateValue } from '../utils/MathUtils.js';
import ConquestManager from '../systems/ConquestManager.js';
import SoulDebtManager from '../systems/SoulDebtManager.js';
import AssetProvider from '../systems/AssetProvider.js';

/**
 * Defender — TEK savunucu sınıfı (veri-odaklı; Faz G mimari refactor).
 *
 * Karakterler arası fark config.DEFENDERS[type] alanlarından okunur — ayrı alt sınıf YOK.
 * Yeni karakter eklemek = config'e bir obje eklemek (spriteKey, projectileType, fireSfx,
 * fireFx, onHitEffect, combatType, statlar). Entity dosyası yazılmaz.
 *
 * İki savaş tipi (config.combatType — K34):
 *  - 'ranged' (okçu/büyücü): çıpada SABİT durur, menzilindekini config.projectileType mermisiyle vurur.
 *    Kiting YOK. Düşman dibine gelirse savunmasız (oyuncunun dizilim işi — önüne tank koy).
 *  - 'melee' (golem/bruiser/blokçu): çıpada TIKAÇ. Düşman temas edince dur-dövüş (karşılıklı HP).
 *    lungeRadius içindeki düşmanı yakalamaya kısa mesafe gider, sonra çıpasına döner. Mermi YOK.
 *
 * onHitEffect (config): 'slow' (mage) | 'heal' (cleric) | undefined. fire() mermiye onHit geçer.
 * fireFx (config): 'recoil' | 'blast' | 'heavy' | 'chill' — görsel ateş efekti seçimi.
 *
 * Birimin HP'si vardır (necromancer hariç — onun canı GameState.necromancer'da ayrı, kendi entity'si).
 * Ölünce SoulDebtManager otomatik diriltir (K11/K29): soul harcar + borç yükler + cooldown.
 */
export default class Defender {
  constructor(scene, type, x, y, index = 0) {
    this.scene = scene;
    this.type = type;
    this.index = index;
    this.x = x;
    this.y = y;
    this.anchorX = x;      // çıpa (K24) — birim buraya bağlı
    this.anchorY = y;
    this.alive = true;
    this.config = CONFIG.DEFENDERS[type];
    this.cooldownTimer = 0;
    this.target = null;
    this.projectiles = [];      // ranged birimlerin uçuşan mermileri (melee'de boş kalır)
    this._shotCount = 0;        // archerSplash sayacı

    // Savaş tipi + HP (K34).
    this.combatType = this.config.combatType || 'ranged';
    this.maxHp = this.config.hp || 30;
    this.hp = this.maxHp;
    this._attackTimer = 0;      // melee dur-dövüş vuruş sayacı
    this._engaged = null;       // melee: şu an dövüştüğü düşman
    this._lungeState = 'anchor'; // 'anchor' | 'lunging' | 'returning'

    // Sprite — config.spriteKey'den (spriteType: 'sprite' animasyonlu, 'image' statik).
    const key = this.config.spriteKey;
    if (key) {
      this.sprite = (this.config.spriteType === 'sprite')
        ? scene.add.sprite(x, y, key).setDepth(5)
        : scene.add.image(x, y, key).setDepth(5);
      AssetProvider.applySprite(this.sprite, key);
      if (this.config.spriteType === 'sprite') AssetProvider.playAnim(this.sprite, key);
    }
  }

  getStateLevels() {
    const d = GameState.defenders[this.type];
    if (!d) return { damage: 1, fireRate: 1, range: 1 };
    return {
      damage: d.damage?.level || 1,
      fireRate: d.fireRate?.level || 1,
      range: d.range?.level || 1,
      blastRadius: d.blastRadius?.level || 1,
      reloadSpeed: d.reloadSpeed?.level || 1,
    };
  }

  getDamage(isBossTarget = false) {
    const l = this.getStateLevels();
    const base = calculateValue(this.config.damage.base, this.config.damage.multiplier, l.damage);
    const bonus = ConquestManager.getDefenderBonus(this.type, 'damage');
    const bossMult = isBossTarget ? ConquestManager.getBossBonus() : 1;
    return base * (1 + bonus) * bossMult;
  }

  rollDamage(isBossTarget = false) {
    let damage = this.getDamage(isBossTarget);
    const crit = CONFIG.COMBAT?.crit;
    const isCrit = crit ? Math.random() < crit.chance : false;
    if (isCrit) damage *= crit.multiplier;
    return { damage, isCrit };
  }

  getFireRate() {
    const l = this.getStateLevels();
    const stat = this.config.fireRate || this.config.reloadSpeed;
    return calculateValue(stat.base, stat.multiplier, l.fireRate || l.reloadSpeed);
  }

  getRange() {
    const l = this.getStateLevels();
    if (!this.config.range) return 999;
    return calculateValue(this.config.range.base, this.config.range.multiplier, l.range);
  }

  findTarget(enemies) {
    const range = this.getRange();
    let closest = null, closestDist = Infinity;
    for (const e of enemies) {
      if (!e.alive || e.dying || !e.sprite) continue;
      const dist = Math.sqrt((e.sprite.x - this.x) ** 2 + (e.sprite.y - this.y) ** 2);
      if (dist <= range && dist < closestDist) { closestDist = dist; closest = e; }
    }
    return closest;
  }

  // ─────────── HP / ölüm / diriltme (K11/K34) ───────────

  /** Düşmandan hasar al (dur-dövüşte). necromancer birimi hasar almaz (canı ayrı). */
  takeDamage(amount) {
    if (!this.alive || this.type === 'necromancer') return;
    this.hp -= amount;
    if (this.sprite) {
      this.sprite.setTintFill(0xff5555);
      this.scene.time.delayedCall(70, () => { if (this.sprite && this.alive) this.sprite.clearTint(); });
    }
    if (this.hp <= 0) this.die();
  }

  /** Birim öldü — sahneden düşer, SoulDebtManager diriltme kuyruğuna alır (K29). */
  die() {
    if (!this.alive) return;
    this.alive = false;
    this.hp = 0;
    this._engaged = null;
    if (this.sprite) {
      this.sprite.setVisible(false);
    }
    // Ölüm efekti (konumda)
    this.scene.spawnDeathParticles?.(this.x, this.y, 'unitDeath');
    this.scene.game.events.emit('sfx', 'deathDefender');
    // Otomatik diriltme kuyruğuna al (soul + borç + cooldown — Faz D bağlantısı)
    SoulDebtManager.onUnitDeath(this);
  }

  /** SoulDebtManager cooldown + soul ödedikten sonra çağırır: birim çıpasında yeniden kalkar. */
  revive() {
    this.alive = true;
    // Diriltme YATIRIMI KORUR (K11/K22): birim güncel tip-level statlarıyla döner, yeni spawn gibi
    // sıfırlanmaz. Damage zaten getDamage()'te canlı okunur; maxHp'yi burada tazeliyoruz ki ileride
    // hp upgrade'i gelirse diriltilen birim de görsün (şu an melee'de hp upgrade yok — ileri-güvence).
    this.maxHp = this.config.hp || 30;
    this.hp = this.maxHp;
    this.x = this.anchorX;
    this.y = this.anchorY;
    this._lungeState = 'anchor';
    this._engaged = null;
    if (this.sprite) {
      this.sprite.setPosition(this.x, this.y).setVisible(true).clearTint();
      // Diriliş pulse
      this.sprite.setScale(0.3);
      this.scene.tweens.add({ targets: this.sprite, scaleX: 1, scaleY: 1, duration: 250, ease: 'Back.easeOut' });
    }
    this.scene.game.events.emit('sfx', 'hire');
  }

  // ─────────── Melee dur-dövüş (K34) ───────────

  /** Melee birimin savaş güncellemesi: tıkaç + lunge + dur-dövüş. */
  updateMelee(delta, enemies) {
    const C = CONFIG.COMBAT;
    // Hâlâ geçerli bir düşmanla dövüşüyor muyuz?
    if (this._engaged && (!this._engaged.alive || this._engaged.dying)) this._engaged = null;

    if (!this._engaged) {
      // lungeRadius içindeki en yakın düşmanı hedefle (yakala)
      let nearest = null, nd = Infinity;
      for (const e of enemies) {
        if (!e.alive || e.dying || !e.sprite) continue;
        const dx = e.sprite.x - this.anchorX, dy = e.sprite.y - this.anchorY;
        const d2 = dx * dx + dy * dy;
        if (d2 < nd) { nd = d2; nearest = e; }
      }
      if (nearest && nd <= C.lungeRadius * C.lungeRadius) {
        this._engaged = nearest;
      }
    }

    if (this._engaged && this._engaged.sprite) {
      // Hedefe doğru lunge (temas mesafesine kadar yaklaş)
      const tx = this._engaged.sprite.x, ty = this._engaged.sprite.y;
      const dx = tx - this.x, dy = ty - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist > C.meleeRange) {
        const step = Math.min(C.lungeSpeed * delta, dist - C.meleeRange);
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        this._lungeState = 'lunging';
      } else {
        // Temas: dur-dövüş — karşılıklı vuruş
        this._lungeState = 'engaged';
        this._attackTimer -= delta;
        if (this._attackTimer <= 0) {
          // Birim-başına meleeAttackRate override (config) — yoksa global sabit (K34).
          // Bruiser bununla golem'den hızlı vurur (ön-saf vurucu kimliği).
          const rate = this.config.meleeAttackRate || C.meleeAttackRate;
          this._attackTimer = 1 / rate;
          const isBoss = this._engaged.type?.startsWith('boss_');
          this._engaged.takeDamage(Math.max(1, Math.floor(this.getDamage(isBoss))), true);
        }
      }
    } else {
      // Düşman yok: çıpaya geri dön
      const dx = this.anchorX - this.x, dy = this.anchorY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const step = Math.min(C.lungeSpeed * delta, dist);
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        this._lungeState = 'returning';
      } else {
        this._lungeState = 'anchor';
      }
    }
    if (this.sprite) this.sprite.setPosition(this.x, this.y);
  }

  update(delta, enemies) {
    if (!this.alive) {
      // Ölü birimin uçmakta olan mermileri yoluna devam etmeli (temizlik için güncelle)
      this._updateProjectiles(delta, enemies);
      return;
    }
    if (this.combatType === 'melee') {
      this.updateMelee(delta, enemies);
      return;
    }
    // ranged: çıpada sabit, menzilden config.projectileType mermisiyle vur
    if (this.cooldownTimer > 0) this.cooldownTimer -= delta;
    this.target = this.findTarget(enemies);
    if (this.target && this.cooldownTimer <= 0) {
      this.fire(this.target);
      this.cooldownTimer = 1 / this.getFireRate();
    }
    this._updateProjectiles(delta, enemies);
  }

  /** Uçuşan mermileri ilerlet, ölenleri havuza iade et. */
  _updateProjectiles(delta, enemies) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(delta, enemies);
      if (!p.alive) { this.projectiles.splice(i, 1); this.scene.projectilePool.release(p); }
    }
  }

  /**
   * Genel ateşleme — config.projectileType mermisini fırlatır, config.fireSfx sesi çalar,
   * config.fireFx görsel efektini oynatır, config.onHitEffect kancasını mermiye bağlar.
   * Melee birimler mermi atmaz (combatType guard update'te), bu yüzden burada projectileType
   * yoksa sessizce çıkılır.
   */
  fire(target) {
    const ptype = this.config.projectileType;
    if (!ptype) return; // melee veya mermisiz birim

    this._shotCount++;
    const isBoss = target.type?.startsWith('boss_');
    const { damage, isCrit } = this.rollDamage(isBoss);
    const radius = this.config.blastRadius ? this.getBlastRadius() : 0;

    // onHit kancası (slow/heal gibi) — onHitEffect config alanından
    const onHit = this._makeOnHit();
    const proj = this.scene.projectilePool.acquire(
      this.scene, this.x, this.y, target, ptype, damage, radius, isCrit, onHit,
    );
    this.projectiles.push(proj);
    if (this.config.fireSfx) this.scene.game.events.emit('sfx', this.config.fireSfx);

    // Archer Mastery splash (Conquest) — config.archerSplash bayraklı birimlerde
    if (this.config.archerSplash) {
      const splash = ConquestManager.getArcherSplash();
      if (splash && this._shotCount % splash.splashEvery === 0 && target.sprite) {
        this._applySplashDamage(target, damage * splash.splashFraction, splash.splashRadius);
      }
    }

    this._playFireFx();
  }

  /** config.onHitEffect'e göre mermi çarpınca çalışacak callback üretir (yoksa null). */
  _makeOnHit() {
    switch (this.config.onHitEffect) {
      case 'slow': return (enemy) => this._applySlow(enemy);
      case 'heal': return null; // heal hedefi düşman değil birim; ayrı mekanik (cleric — Aşama 4)
      default:     return null;
    }
  }

  getBlastRadius() {
    const l = this.getStateLevels();
    return calculateValue(this.config.blastRadius.base, this.config.blastRadius.multiplier, l.blastRadius);
  }

  // ─────────── Ateş efektleri (config.fireFx ile seçilir) ───────────
  _playFireFx() {
    if (!this.sprite) return;
    const fx = this.config.fireFx;
    if (fx === 'recoil') {
      this.scene.tweens.add({ targets: this.sprite, x: this.x - 4, duration: 50, yoyo: true, ease: 'Power1' });
    } else if (fx === 'blast') {
      this.scene.tweens.add({ targets: this.sprite, x: this.x - 6, duration: 60, yoyo: true, ease: 'Power2' });
      const flame = this.scene.add.circle(this.x + 10, this.y, 4, 0xff4400, 0.8).setDepth(15);
      this.scene.tweens.add({ targets: flame, scaleX: 2, scaleY: 2, alpha: 0, duration: 200, onComplete: () => flame.destroy() });
    } else if (fx === 'heavy') {
      this.scene.tweens.add({ targets: this.sprite, x: this.x - 8, duration: 80, yoyo: true, ease: 'Power2' });
      const smoke = this.scene.add.circle(this.x + 12, this.y, 6, 0x887766, 0.7).setDepth(15);
      this.scene.tweens.add({ targets: smoke, scaleX: 3, scaleY: 3, alpha: 0, duration: 350, onComplete: () => smoke.destroy() });
    } else if (fx === 'chill') {
      this.scene.tweens.add({ targets: this.sprite, y: this.y - 3, duration: 60, yoyo: true, ease: 'Power1' });
    }
  }

  // ─────────── onHit etkileri ───────────

  /** Yavaşlatma debuff (mage). config.slowFraction/slowDuration. */
  _applySlow(enemy) {
    if (!enemy || !enemy.alive) return;
    const slowFrac = this.config.slowFraction ?? 0.45;
    const dur = this.config.slowDuration ?? 2.5;
    if (!enemy._baseSpeed) enemy._baseSpeed = enemy.speed;
    enemy.speed = enemy._baseSpeed * slowFrac;
    enemy._slowTimer = dur;
    if (enemy.sprite) enemy.sprite.setTint(0x88ccff);
  }

  /** Hedef etrafındaki düşmanlara alan hasarı (Archer Mastery splash). */
  _applySplashDamage(centerEnemy, splashDmg, radius) {
    const enemies = this.scene.waveManager?.enemies;
    if (!enemies || !centerEnemy.sprite) return;
    const r2 = radius * radius;
    const cx = centerEnemy.sprite.x, cy = centerEnemy.sprite.y;
    const ring = this.scene.add.circle(cx, cy, radius * 0.5, 0xffaa00, 0.22).setDepth(9);
    this.scene.tweens.add({ targets: ring, scaleX: 2, scaleY: 2, alpha: 0, duration: 350, ease: 'Power2', onComplete: () => ring.destroy() });
    for (const e of enemies) {
      if (!e.alive || e.dying || !e.sprite || e === centerEnemy) continue;
      const dx = e.sprite.x - cx, dy = e.sprite.y - cy;
      if (dx * dx + dy * dy <= r2) e.takeDamage(Math.max(1, Math.floor(splashDmg)), false);
    }
  }

  destroy() {
    this.alive = false;
    this.target = null;
    this.projectiles.forEach(p => this.scene.projectilePool?.release(p));
    this.projectiles = [];
    this.sprite?.destroy();
    this.sprite = null;
  }
}
