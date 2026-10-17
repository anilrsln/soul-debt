import GameState, { resetForPrestige } from '../state/GameState.js';
import { CONFIG } from '../config.js';

/**
 * PrestigeManager — Prestige: Model Y (derinlik çarpanı) + iki yol (K14/K15/K26).
 *
 * İki yol:
 *  - GÖNÜLLÜ (tanrıyı yen, Kat N): tam çarpan. Oyunun hedefi, zafer anı.
 *  - ZORLANMIŞ (necromancer öl): yarı çarpan (forcedRatio, Diş-1). Başarısızlık-reset'i.
 *
 * Model Y: çarpan ulaşılan DERİNLİĞE (kata) bağlı (K15). Derine inmek, ölsen bile
 * daha çok çarpan verir — iniş temasını ödüle bağlar.
 *
 * Kalıcı kalan: prestige çarpanı + açılmış birim TİPLERİ (node kilidi). Sıfırlanan:
 * soul/meta, upgrade'ler, birim adetleri, kat, soul-debt (K33 model A).
 */
const PrestigeManager = {
  /** wave → kat (1-tabanlı). Wave 1-10 = Kat 1, 11-20 = Kat 2 ... (K7). */
  waveToFloor(wave = GameState.wave.current) {
    return Math.max(1, Math.ceil(wave / CONFIG.PRESTIGE.wavesPerFloor));
  },

  /** Ulaşılan güncel derinlik (kat). */
  getCurrentFloor() {
    return this.waveToFloor();
  },

  /**
   * Bu koşunun kazandıracağı KALICI çarpan artışı (Model Y — K15).
   * @param {number} depth — ulaşılan kat
   * @param {boolean} isVictory — true: gönüllü (tam), false: zorlanmış (yarı — K14)
   */
  getRunMultiplierGain(depth, isVictory) {
    const P = CONFIG.PRESTIGE;
    const gain = P.baseMultiplierGain + depth * P.perFloorGain;
    return isVictory ? gain : gain * P.forcedRatio;
  },

  /** Mevcut toplam çarpan. */
  getCurrentMultiplier() {
    return GameState.prestige.multiplier;
  },

  getPrestigeCount() {
    return GameState.prestige.count;
  },

  /**
   * Prestige'i gerçekleştir — ortak reset + çarpan birikimi.
   * @param {boolean} isVictory — gönüllü (zafer) mi, zorlanmış (ölüm) mü
   * @returns {{gain:number, newMultiplier:number, depth:number}}
   */
  _doPrestige(isVictory) {
    const depth = this.getCurrentFloor();
    const gain = this.getRunMultiplierGain(depth, isVictory);

    GameState.prestige.count += 1;
    GameState.prestige.multiplier += gain; // çarpan BİRİKİR (her prestige ekler)

    // Açılmış birim TİPLERİ kalıcı (DESIGN 7.1): reset öncesi unlocked tipleri sakla
    const unlockedTypes = {};
    for (const [type, d] of Object.entries(GameState.defenders)) {
      if (d && (d.unlocked || d.canBeHired)) {
        unlockedTypes[type] = { unlocked: !!d.unlocked, canBeHired: !!d.canBeHired };
      }
    }

    // Koşu-içi her şeyi sıfırla (soul/meta/upgrade/adet/kat/soul-debt — K33)
    resetForPrestige(GameState);
    GameState.conquestMap.bonuses = {};

    // Birim TİP kilitlerini geri uygula (adet 0 ama tip açık kalır)
    for (const [type, locks] of Object.entries(unlockedTypes)) {
      if (GameState.defenders[type]) {
        GameState.defenders[type].unlocked = locks.unlocked;
        GameState.defenders[type].canBeHired = locks.canBeHired;
      }
    }

    return { gain, newMultiplier: GameState.prestige.multiplier, depth };
  },

  /** GÖNÜLLÜ prestige — tanrıyı yendin (zafer). Tam çarpan (K14/K26). */
  voluntaryPrestige() {
    return this._doPrestige(true);
  },

  /** ZORLANMIŞ prestige — necromancer öldü. Yarı çarpan (Diş-1, K14). */
  forcedPrestige() {
    return this._doPrestige(false);
  },

  // ── Geriye dönük uyumluluk (eski çağrılar için) ──
  canPrestige() { return true; },
  getNextMultiplier() {
    return GameState.prestige.multiplier + this.getRunMultiplierGain(this.getCurrentFloor(), true);
  },
};

export default PrestigeManager;
