import { CONFIG } from '../config.js';

/**
 * VeteranManager — Birim kıdem (veteran) sistemi (K37).
 *
 * Kazanılan soul, o an SAHADA CANLI olan birimlere EŞİT pay edilir ("kıdem tecrübesi").
 * Bu PARALEL bir sayaçtır — gerçek soul ekonomisinden (GameState.resources.soul) DÜŞMEZ.
 * Pay, birimin `veteranSoul` birikticine yazılır; üstel eşik geçilince `veteranLevel` artar.
 *
 * Kıdem, birimin damage/hp/special statlarına bir çarpan uygular (Defender bunu okur):
 *   çarpan(stat) = 1 + veteranLevel × veteranBonus[stat]
 * veteranBonus birim config'inden (CONFIG.DEFENDERS[type].veteranBonus), yoksa CONFIG.VETERAN.defaultBonus.
 *
 * Derin dalgalarda düşman daha çok soul düşürür → kıdem derinlikle kendiliğinden ölçeklenir
 * (ayrı "wave bonusu" gerekmez). Üstel eşik → üst seviyeler kendiliğinden yavaşlar (sert tavan yok).
 *
 * Diriltme kıdemi KORUR (Defender.revive veteranSoul/Level'e dokunmaz);
 * iptal/kalıcı ölüm SIFIRLAR (resetVeteran). Kıdem koşu-içidir (save'de tutulmaz; prestige sıfırlar).
 */
const VeteranManager = {
  _scene: null,

  init(scene) {
    this._scene = scene;
  },

  /**
   * Kazanılan soul'u sahadaki canlı birimlere eşit dağıt (K37 eşit dağıtım).
   * @param {number} soul — bu kill/hasat ile kazanılan soul miktarı
   */
  distribute(soul) {
    if (!(soul > 0) || !this._scene) return;
    const units = this._scene.getAllUnits?.() || [];
    const living = units.filter(u => u && u.alive);
    if (living.length === 0) return;
    const share = (soul * CONFIG.VETERAN.soulToXpRate) / living.length;
    for (const u of living) this._grantXp(u, share);
  },

  /** Bir birime kıdem tecrübesi ekle; eşik(ler) aşılırsa seviye atlat. */
  _grantXp(unit, amount) {
    if (!unit) return;
    unit.veteranSoul = (unit.veteranSoul || 0) + amount;
    unit.veteranLevel = unit.veteranLevel || 0;
    // Birden fazla seviye tek karede atlanabilir (büyük soul payı) — while ile tüket.
    let need = this._thresholdFor(unit.veteranLevel);
    while (unit.veteranSoul >= need) {
      unit.veteranSoul -= need;
      unit.veteranLevel += 1;
      unit.applyVeteranLevel?.();          // birim maxHp'sini tazelesin (damage/special anlık okunur)
      this._scene?.onVeteranLevelUp?.(unit); // sahneye görsel/ses için haber
      need = this._thresholdFor(unit.veteranLevel);
    }
  },

  /** Seviye L→L+1 için gereken veteranSoul (üstel). L=0 ⇒ baseThreshold. */
  _thresholdFor(level) {
    const v = CONFIG.VETERAN;
    return v.baseThreshold * Math.pow(v.thresholdGrowth, level);
  },

  /** Birimin bir stat için kıdem çarpanı: 1 + level × bonus[stat]. */
  getMultiplier(unit, stat) {
    const level = unit?.veteranLevel || 0;
    if (level <= 0) return 1;
    const type = unit?.type;
    const bonus = CONFIG.DEFENDERS[type]?.veteranBonus || CONFIG.VETERAN.defaultBonus;
    const per = bonus?.[stat] ?? 0;
    return 1 + level * per;
  },

  /** İptal/kalıcı ölüm: kıdemi tamamen sıfırla (K37). */
  resetVeteran(unit) {
    if (!unit) return;
    unit.veteranSoul = 0;
    unit.veteranLevel = 0;
  },
};

export default VeteranManager;
