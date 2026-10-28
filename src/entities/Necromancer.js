import { CONFIG } from '../config.js';
import Defender from './Defender.js';
import GameState from '../state/GameState.js';
import ConquestManager from '../systems/ConquestManager.js';
import AssetProvider from '../systems/AssetProvider.js';

/**
 * Necromancer — oyunun başlangıç birimi (K25). Sabit konumlu, menzilli, hep sahnede.
 * Sürekli ışın hasarı verir (eski LaserMonument mantığı korunur) VE bir can havuzudur
 * (K10/K13): hat ihlalinde (Enemy.breachLine) canından kesilir, 0'da koşu biter.
 *
 * Hedefleme (K25): varsayılan en yakın düşman; oyuncu bir düşmanı tıklarsa YAPIŞKAN hedef
 * (o ölene/menzilden çıkana kadar), sonra otomatiğe döner. Yalnız necromancer yönlendirilir.
 *
 * Anahtar: DEFENDERS.necromancer (eski 'laser' K23 ile temizlendi). Sprite 'defender-necromancer'.
 * Registry'ye dahil DEĞİL (GameScene.defenderKeys necromancer'ı dışlar) — kendi yaşam döngüsü var.
 */
export default class Necromancer extends Defender {
  constructor(scene, x, y) {
    super(scene, 'necromancer', x, y);
    this.sprite = scene.add.sprite(x, y, 'defender-necromancer').setDepth(5);
    AssetProvider.applySprite(this.sprite, 'defender-necromancer');
    AssetProvider.playAnim(this.sprite, 'defender-necromancer', 'idle');
    this._castTimer = 0; // ışın atarken kısa 'attack' animasyonu tutma süresi
    this.beamGraphics = scene.add.graphics().setDepth(6);
    this.glowPhase = 0;
    this.damageAccumulator = 0;
    this.isBeamActive = false;
    this.stickyTarget = null; // oyuncunun tıkladığı yapışkan hedef (K25)
    this._autoLock = null;    // otomatik kilitli hedef (K35) — ölene/menzilden çıkana kadar sadık
    this.commandedTarget = null; // sağ-tık saldırı komutu — hedefe yürür, menzilde ışınlar (K38)
  }

  /** Oyuncu bir düşmanı tıkladı — yapışkan hedef ata (K25). */
  setStickyTarget(enemy) {
    this.stickyTarget = enemy;
  }

  /** Hedef geçerli mi (canlı + menzilde)? */
  _targetValid(t, range) {
    if (!t || !t.alive || t.dying || !t.sprite) return false;
    const dist = Math.sqrt((t.sprite.x - this.x) ** 2 + (t.sprite.y - this.y) ** 2);
    return dist <= range;
  }

  /**
   * Hedef seçimi (K35) — öncelik sırası:
   *  1) Yapışkan hedef (oyuncu tıkladı) — her şeyin üstünde.
   *  2) Acil tehdit: necromancer'a kritik yakın (emergencyThreatDist) düşman → kilit kırılır,
   *     "can havliyle" ona müdahale eder (son savunma refleksi).
   *  3) Kilitli otomatik hedef: seçtiği hedefi ölene/menzilden çıkana kadar vurur (zıplama YOK).
   *  4) Yeni kilit: menzildeki en yakını seç.
   */
  findTarget(enemies) {
    const range = this.getRange();

    // 1) Yapışkan (oyuncu komutu)
    if (this.stickyTarget) {
      if (this._targetValid(this.stickyTarget, range)) return this.stickyTarget;
      this.stickyTarget = null;
    }

    // 2) Acil tehdit — necromancer'a çok yakın bir düşman varsa kilidi kır, ona geç
    const threatDist = this.config.emergencyThreatDist ?? 70;
    let threat = null, td = Infinity;
    for (const e of enemies) {
      if (!e.alive || e.dying || !e.sprite) continue;
      const dx = e.sprite.x - this.x, dy = e.sprite.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= threatDist && d < td) { td = d; threat = e; }
    }
    if (threat) { this._autoLock = threat; return threat; }

    // 3) Kilitli otomatik hedef hâlâ geçerliyse ONA SADIK KAL (zıplama yok)
    if (this._autoLock && this._targetValid(this._autoLock, range)) {
      return this._autoLock;
    }

    // 4) Yeni kilit: menzildeki en yakın
    this._autoLock = super.findTarget(enemies);
    return this._autoLock;
  }

  update(delta, enemies) {
    if (!this.alive) return;

    // Komut hedefi geçersizse temizle (ölen hedef → otomatik moda dön)
    if (this.commandedTarget && (!this.commandedTarget.alive || this.commandedTarget.dying)) {
      this.commandedTarget = null;
      this.stickyTarget = null;
    }

    // Hareket: komut hedefi varsa ONU ÖLENE KADAR KOVALA (menzil dışıysa yürü, menzildeyse
    // yürümese bile ışınla); yoksa çıpaya yürü.
    let moving = false, inRange = true;
    if (this.commandedTarget && this.commandedTarget.sprite) {
      const range = this.getRange();
      const stopDist = range * 0.9; // menzilin biraz içine yürü (kenar titremesi + yetişme)
      const tx = this.commandedTarget.sprite.x, ty = this.commandedTarget.sprite.y;
      const dx = tx - this.x, dy = ty - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist > range) {
        const step = Math.min(CONFIG.COMBAT.lungeSpeed * delta, dist - stopDist);
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        if (this.sprite) this.sprite.setPosition(this.x, this.y);
        moving = true;
      }
      inRange = dist <= range; // menzildeyse ışınla (yürümüş olsa da)
      this.anchorX = this.x; this.anchorY = this.y; // komut bitince burada kalır
      // Komut hedefi SABİT ışın hedefi — findTarget'a bırakma (kaçanı ölene kadar kovala/ışınla)
      this.target = this.commandedTarget;
    } else {
      moving = this._walkToAnchor(delta); // taşıma komutu → çıpaya yürü
      inRange = !moving;
      this.target = this.findTarget(enemies);
    }

    this.beamGraphics.clear();

    // Menzildeyse ışınla (komutla kovalarken menzile girince yürüyor olsa da ışınlar)
    if (this.target && inRange) {
      this.isBeamActive = true;
      this.drawBeam(delta);
      this.applyDamage(delta);
    } else {
      this.isBeamActive = false;
    }

    this.glowPhase += delta * 3;
    this.updateGlow();

    // Animasyon: yürürken 'walk', ışın atarken 'attack' (periyodik yeniden tetik), boşta 'idle'.
    this._castTimer -= delta;
    if (moving) {
      AssetProvider.playAnim(this.sprite, 'defender-necromancer', 'walk');
    } else if (this.target) {
      if (this._castTimer <= 0) {
        AssetProvider.playAnim(this.sprite, 'defender-necromancer', 'attack');
        this._castTimer = 0.6; // attack döngüsünü ~0.6 sn'de bir yenile
      }
    } else if (this._castTimer <= 0) {
      AssetProvider.playAnim(this.sprite, 'defender-necromancer', 'idle');
    }
  }

  drawBeam(delta) {
    if (!this.target || !this.target.sprite) return;
    const tx = this.target.sprite.x, ty = this.target.sprite.y;

    // Dış ışın (kalın, yarı saydam)
    const glowAlpha = 0.3 + Math.sin(this.glowPhase) * 0.1;
    this.beamGraphics.lineStyle(6, CONFIG.COLORS.LASER, glowAlpha);
    this.beamGraphics.beginPath();
    this.beamGraphics.moveTo(this.x, this.y);
    this.beamGraphics.lineTo(tx, ty);
    this.beamGraphics.strokePath();

    // İç çekirdek (ince, parlak)
    this.beamGraphics.lineStyle(2, 0xffffff, 0.9);
    this.beamGraphics.beginPath();
    this.beamGraphics.moveTo(this.x, this.y);
    this.beamGraphics.lineTo(tx, ty);
    this.beamGraphics.strokePath();
  }

  applyDamage(delta) {
    if (!this.target || !this.target.alive || this.target.dying) return;
    const isBoss = this.target.type?.startsWith('boss_');
    // Sürekli hasar: DPS = damage * fireRate
    const dps = this.getDamage(isBoss) * this.getFireRate();
    this.damageAccumulator += dps * delta;

    if (this.damageAccumulator >= 1) {
      const dmg = Math.floor(this.damageAccumulator);
      this.damageAccumulator -= dmg;
      this.target.takeDamage(dmg, false); // ışın flash yok (sürekli hasar)

      // Laser Enhancement II: chain — en yakın ikinci hedefe ek hasar
      const chain = ConquestManager.getLaserChain();
      if (chain) this._applyChain(dmg, chain.chainFraction);
    }
  }

  /** Chain: ana hedeften sonra en yakın ikinci düşmana zincirleme hasar. */
  _applyChain(primaryDmg, fraction) {
    const enemies = this.scene.waveManager?.enemies;
    if (!enemies || !this.target?.sprite) return;
    let chainTarget = null, closestDist = Infinity;
    const tx = this.target.sprite.x, ty = this.target.sprite.y;
    for (const e of enemies) {
      if (!e.alive || e.dying || e === this.target || !e.sprite) continue;
      const dx = e.sprite.x - tx, dy = e.sprite.y - ty;
      const dist = dx * dx + dy * dy;
      if (dist < closestDist) { closestDist = dist; chainTarget = e; }
    }
    if (!chainTarget) return;
    chainTarget.takeDamage(Math.max(1, Math.floor(primaryDmg * fraction)), false);
    const g = this.scene.add.graphics().setDepth(7);
    g.lineStyle(1, 0x44eeff, 0.55);
    g.beginPath();
    g.moveTo(this.target.sprite.x, this.target.sprite.y);
    g.lineTo(chainTarget.sprite.x, chainTarget.sprite.y);
    g.strokePath();
    this.scene.time.delayedCall(120, () => g.destroy());
  }

  updateGlow() {
    if (!this.sprite) return;
    this.sprite.setAlpha(1); // sabit — yanıp sönme yok
  }

  destroy() {
    super.destroy();
    this.beamGraphics?.destroy();
    this.sprite?.destroy();
    this.sprite = null;
  }
}
