import GameState from '../state/GameState.js';
import { calculateUpgradeCost } from '../utils/MathUtils.js';
import { CONFIG } from '../config.js';

/**
 * EconomyManager — Soul/meta toplama, yükseltme maliyeti, satın alma işlemleri.
 * NOT: Model 3 hire (tip-açma=node, örme=soul+meta) yeni kadro+unitUnlock node ile Faz B4/G'de tamamlanır.
 * Şimdilik mevcut hire mantığı soul+meta'ya (bone) geçirildi; çalışır ara durum.
 */
const EconomyManager = {
  /**
   * Upgrade maliyetini hesaplar.
   * @param {string} defenderType — 'laser' | 'archer' | 'cannon'
   * @param {string} statName — 'damage' | 'fireRate' | 'range' | 'blastRadius' | 'reloadSpeed'
   * @returns {number} Maliyet (soul)
   */
  getUpgradeCost(defenderType, statName) {
    const def = CONFIG.DEFENDERS[defenderType];
    const statConfig = def[statName];
    if (!statConfig || !statConfig.baseCost) return Infinity;
    const currentLevel = GameState.defenders[defenderType][statName]?.level || 1;
    return calculateUpgradeCost(statConfig.baseCost, CONFIG.UPGRADE_COST_MULTIPLIER, currentLevel);
  },

  /**
   * Yükseltme satın alımı yapar.
   * @returns {boolean} Başarılı mı
   */
  purchaseUpgrade(defenderType, statName) {
    const cost = this.getUpgradeCost(defenderType, statName);
    if (GameState.resources.soul < cost) return false;
    // Defender kilidi açık mı? (laser her zaman açık)
    if (defenderType !== 'laser' && !GameState.defenders[defenderType].unlocked) return false;

    GameState.resources.soul -= cost;
    GameState.defenders[defenderType][statName].level += 1;
    return true;
  },

  /**
   * Savunucu kiralama maliyetini hesaplar (meta: bone — Model 3 geçici).
   * @returns {number} Maliyet
   */
  getHireCost(defenderType) {
    const def = CONFIG.DEFENDERS[defenderType];
    const count = GameState.defenders[defenderType].count || 0;
    // Model 3 (K30): craftCost çok-metalı olabilir { soul, bone?, essence?, crystal? }.
    // Her örme count ile ölçeklenir. craftCost yoksa eski hireCost'tan bone maliyeti türetilir (geçici).
    if (def.craftCost) {
      const scaled = {};
      for (const [res, base] of Object.entries(def.craftCost)) {
        scaled[res] = Math.floor(base * Math.pow(def.craftCostMultiplier ?? 1.5, count));
      }
      return scaled;
    }
    if (!def.hireCost) return 0; // laser/necromancer hire edilmez
    // Fallback: tek-meta (bone) — yeni kadro gelince craftCost ile değişir
    return { bone: Math.floor(def.hireCost * Math.pow(def.hireCostMultiplier, count)) };
  },

  /** Bir maliyet objesinin ({soul, bone, ...}) karşılanıp karşılanmadığı. */
  _canAfford(cost) {
    if (!cost || typeof cost === 'number') return false;
    for (const [res, amt] of Object.entries(cost)) {
      if ((GameState.resources[res] || 0) < amt) return false;
    }
    return true;
  },

  /** Bir maliyet objesini kaynaklardan düş. */
  _spend(cost) {
    for (const [res, amt] of Object.entries(cost)) {
      GameState.resources[res] -= amt;
    }
  },

  /**
   * Yeni savunucu kiralar (meta: bone harcar — Model 3 tamamlanınca soul+meta).
   * @returns {boolean} Başarılı mı
   */
  hireDefender(defenderType) {
    const state = GameState.defenders[defenderType];
    if (!state) return false;

    // Conquest kilidi kontrolü (cannon / frost / catapult)
    if (['cannon', 'frost', 'catapult'].includes(defenderType) && state.canBeHired === false) return false;

    const cost = this.getHireCost(defenderType);
    if (!cost || cost === 0) return false;

    // İlk kiralama — kilidi aç
    if (!state.unlocked) {
      if (!this._canAfford(cost)) return false;
      this._spend(cost);
      state.unlocked = true;
      state.count = 1;
      return true;
    }

    // Maks sayıya ulaşıldı mı
    if (state.count >= state.maxCount) return false;
    if (!this._canAfford(cost)) return false;

    this._spend(cost);
    state.count += 1;
    return true;
  },

  /**
   * Yükseltme satın alınabilir mi?
   */
  canAffordUpgrade(defenderType, statName) {
    const cost = this.getUpgradeCost(defenderType, statName);
    if (defenderType !== 'laser' && !GameState.defenders[defenderType].unlocked) return false;
    return GameState.resources.soul >= cost;
  },

  /**
   * Savunucu kiralanabilir mi?
   */
  canAffordHire(defenderType) {
    const state = GameState.defenders[defenderType];
    if (!state) return false;
    if (['cannon', 'frost', 'catapult'].includes(defenderType) && state.canBeHired === false) return false;
    if (state.unlocked && state.count >= state.maxCount) return false;
    const cost = this.getHireCost(defenderType);
    return this._canAfford(cost);
  },

  // ═══════════════ Ekonomi upgrade'leri (soul/meta kazanç çarpanı) ═══════════════

  /** 'soulBoost' | 'metaBoost' için mevcut çarpan (1 + level × bonus). */
  getEconomyBoostMultiplier(key) {
    const cfg = CONFIG.ECONOMY_UPGRADES[key];
    if (!cfg) return 1;
    const level = GameState.economy?.[key]?.level || 0;
    return 1 + level * cfg.bonusPerLevel;
  },

  /** Bir sonraki ekonomi upgrade'inin maliyeti (soul). */
  getEconomyUpgradeCost(key) {
    const cfg = CONFIG.ECONOMY_UPGRADES[key];
    if (!cfg) return Infinity;
    const level = GameState.economy?.[key]?.level || 0;
    return Math.floor(cfg.baseCost * Math.pow(cfg.costMultiplier, level));
  },

  canAffordEconomyUpgrade(key) {
    return GameState.resources.soul >= this.getEconomyUpgradeCost(key);
  },

  /** Ekonomi upgrade satın al (soul ile). */
  purchaseEconomyUpgrade(key) {
    const cost = this.getEconomyUpgradeCost(key);
    if (GameState.resources.soul < cost) return false;
    GameState.resources.soul -= cost;
    if (!GameState.economy[key]) GameState.economy[key] = { level: 0 };
    GameState.economy[key].level += 1;
    return true;
  },
};

export default EconomyManager;
