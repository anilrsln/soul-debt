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
 * NOT: config/state anahtarı tarihsel olarak 'laser' (dönüşüm seçeneği A); anahtar yeniden
 * adlandırma Faz G (K23 ile). Sprite anahtarı 'defender-laser' asset olarak korunur.
 */
export default class Necromancer extends Defender {
  constructor(scene, x, y) {
    super(scene, 'laser', x, y);
    this.sprite = scene.add.image(x, y, 'defender-laser').setDepth(5);
    AssetProvider.applySprite(this.sprite, 'defender-laser');
    this.beamGraphics = scene.add.graphics().setDepth(6);
    this.glowPhase = 0;
    this.damageAccumulator = 0;
    this.isBeamActive = false;
    this.stickyTarget = null; // oyuncunun tıkladığı yapışkan hedef (K25)
  }

  /** Oyuncu bir düşmanı tıkladı — yapışkan hedef ata (K25). */
  setStickyTarget(enemy) {
    this.stickyTarget = enemy;
  }

  /** Hedef seçimi: geçerli yapışkan hedef menzildeyse onu, değilse en yakını. */
  findTarget(enemies) {
    const range = this.getRange();
    // Yapışkan hedef hâlâ geçerli mi (canlı + menzilde)?
    if (this.stickyTarget) {
      const s = this.stickyTarget;
      if (s.alive && !s.dying && s.sprite) {
        const dist = Math.sqrt((s.sprite.x - this.x) ** 2 + (s.sprite.y - this.y) ** 2);
        if (dist <= range) return s;
      }
      this.stickyTarget = null; // öldü/menzilden çıktı → otomatiğe dön
    }
    return super.findTarget(enemies);
  }

  update(delta, enemies) {
    if (!this.alive) return;
    this.target = this.findTarget(enemies);
    this.beamGraphics.clear();

    if (this.target) {
      this.isBeamActive = true;
      this.drawBeam(delta);
      this.applyDamage(delta);
    } else {
      this.isBeamActive = false;
    }

    this.glowPhase += delta * 3;
    this.updateGlow();
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
