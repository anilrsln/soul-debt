import { CONFIG } from '../config.js';
import GameState from '../state/GameState.js';
import { calculateValue } from '../utils/MathUtils.js';
import ConquestManager from '../systems/ConquestManager.js';
import SoulDebtManager from '../systems/SoulDebtManager.js';

/**
 * Defender — Savunucu base class (Faz E: dur-dövüş + çıpa + melee/ranged).
 *
 * İki savaş tipi (config.combatType — K34):
 *  - 'ranged' (okçu/büyücü/necromancer): çıpada SABİT durur, menzilindekini vurur (alt sınıf fire()).
 *    Kiting YOK. Düşman dibine gelirse savunmasız (oyuncunun dizilim işi — önüne tank koy).
 *  - 'melee' (golem/blokçu): çıpada TIKAÇ. Düşman temas edince dur-dövüş (karşılıklı HP).
 *    lungeRadius içindeki düşmanı yakalamaya kısa mesafe gider, sonra çıpasına döner.
 *
 * Birimin HP'si vardır (necromancer hariç — onun canı GameState.necromancer'da ayrı).
 * Ölünce SoulDebtManager otomatik diriltir (K11/K29): soul harcar + borç yükler + cooldown.
 */
export default class Defender {
  constructor(scene, type, x, y) {
    this.scene = scene;
    this.type = type;
    this.x = x;
    this.y = y;
    this.anchorX = x;      // çıpa (K24) — birim buraya bağlı
    this.anchorY = y;
    this.alive = true;
    this.config = CONFIG.DEFENDERS[type];
    this.cooldownTimer = 0;
    this.target = null;

    // Savaş tipi + HP (K34). necromancer(laser) canı ayrı yönetildiği için HP'si pasif.
    this.combatType = this.config.combatType || 'ranged';
    this.maxHp = this.config.hp || 30;
    this.hp = this.maxHp;
    this._attackTimer = 0;      // melee dur-dövüş vuruş sayacı
    this._engaged = null;       // melee: şu an dövüştüğü düşman
    this._lungeState = 'anchor'; // 'anchor' | 'lunging' | 'returning'
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
    if (!this.alive || this.type === 'laser') return;
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
          this._attackTimer = 1 / C.meleeAttackRate;
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
    if (!this.alive) return;
    if (this.combatType === 'melee') {
      this.updateMelee(delta, enemies);
      return;
    }
    // ranged varsayılan: çıpada sabit, menzilden vur (alt sınıf fire() override eder)
    if (this.cooldownTimer > 0) this.cooldownTimer -= delta;
    this.target = this.findTarget(enemies);
    if (this.target && this.cooldownTimer <= 0) {
      this.fire(this.target);
      this.cooldownTimer = 1 / this.getFireRate();
    }
  }

  fire(target) { /* Alt sınıf override eder */ }
  destroy() { this.alive = false; this.target = null; }
}
