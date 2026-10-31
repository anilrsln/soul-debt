import { CONFIG } from '../config.js';
import GameState from '../state/GameState.js';

/**
 * ConquestManager — Conquest Map node yönetimi.
 * Node satın alma, kilit kontrolü, bonus uygulama.
 */
const ConquestManager = {
  /** Node açık mı? */
  isUnlocked(nodeId) {
    return GameState.conquestMap.unlockedNodes.includes(nodeId);
  },

  /** Node'un tüm gereksinimleri karşılanmış mı? */
  isAvailable(nodeId) {
    if (this.isUnlocked(nodeId)) return false;
    const node = CONFIG.CONQUEST_NODES[nodeId];
    if (!node) return false;
    return node.requires.every(req => this.isUnlocked(req));
  },

  /** Node satın alınabilir mi? (maliyet + gereksinim)
   *  Maliyet herhangi bir kaynak kombinasyonu olabilir ({soul, bone, essence, crystal});
   *  K21 unitUnlock node'ları geldiğinde çok-kaynaklı maliyetler de doğru kontrol edilir. */
  canPurchase(nodeId) {
    if (!this.isAvailable(nodeId)) return false;
    const node = CONFIG.CONQUEST_NODES[nodeId];
    for (const [res, amt] of Object.entries(node.cost)) {
      if ((GameState.resources[res] || 0) < amt) return false;
    }
    return true;
  },

  /** Bir defender tipini açan unlock node'unun id'si (effect.type==='unlock' && target===type). */
  unlockNodeIdFor(type) {
    for (const [id, node] of Object.entries(CONFIG.CONQUEST_NODES)) {
      if (node.effect?.type === 'unlock' && node.effect.target === type) return id;
    }
    return null;
  },

  /** Bir tipin unlock node'u şu an satın alınabilir mi? (gereksinim + maliyet) */
  canUnlockFromPanel(type) {
    const id = this.unlockNodeIdFor(type);
    return id ? this.canPurchase(id) : false;
  },

  /** Bir tipin unlock node'unun maliyeti (panelde göstermek için). */
  unlockCostFor(type) {
    const id = this.unlockNodeIdFor(type);
    return id ? CONFIG.CONQUEST_NODES[id]?.cost : null;
  },

  /** Panelden unlock: o tipin conquest node'unu satın al (map ile TEK ve AYNI işlem — K40).
   *  Böylece map'ten de panelden de açılabilir, biri açılınca diğeri de açık olur, çift ödeme yok. */
  purchaseUnlockFor(type) {
    const id = this.unlockNodeIdFor(type);
    if (!id) return false;
    return this.purchase(id);
  },

  /** Node satın al. */
  purchase(nodeId) {
    if (!this.canPurchase(nodeId)) return false;
    const node = CONFIG.CONQUEST_NODES[nodeId];

    // Kaynak harca — maliyetteki tüm kaynaklar (soul/bone/essence/crystal)
    for (const [res, amt] of Object.entries(node.cost)) {
      GameState.resources[res] = (GameState.resources[res] || 0) - amt;
    }

    // Node'u aç
    GameState.conquestMap.unlockedNodes.push(nodeId);

    // Efekti uygula
    this.applyEffect(node.effect);
    return true;
  },

  /** Node efektini uygula. */
  applyEffect(effect) {
    const bonuses = GameState.conquestMap.bonuses;

    switch (effect.type) {
      case 'defenderBoost': {
        if (!bonuses.defenderBoost) bonuses.defenderBoost = {};
        if (!bonuses.defenderBoost[effect.target]) bonuses.defenderBoost[effect.target] = {};
        const current = bonuses.defenderBoost[effect.target][effect.stat] || 0;
        bonuses.defenderBoost[effect.target][effect.stat] = current + effect.value;
        break;
      }
      case 'globalBonus': {
        if (!bonuses.globalBonus) bonuses.globalBonus = {};
        const current = bonuses.globalBonus[effect.stat] || 0;
        bonuses.globalBonus[effect.stat] = current + effect.value;
        break;
      }
      case 'economy': {
        if (!bonuses.economy) bonuses.economy = {};
        const current = bonuses.economy[effect.stat] || 0;
        bonuses.economy[effect.stat] = current + effect.value;
        break;
      }
      case 'unlock': {
        // Jenerik: hangi defender olursa olsun canBeHired aç (golem/mage/bruiser/cleric...).
        // prestige target'ı KALDIRILDI (prestigeUnlock node ölüydü — prestige otomatik tetikli, K26).
        if (GameState.defenders[effect.target]) {
          GameState.defenders[effect.target].canBeHired = true;
        }
        break;
      }
      case 'archerSplash': {
        // Her N. okta alan hasarı — parametreler doğrudan effect objesinde
        bonuses.archerSplash = { splashEvery: effect.splashEvery, splashRadius: effect.splashRadius, splashFraction: effect.splashFraction };
        break;
      }
      case 'laserChain': {
        // Lazer ikinci hedefe zincirleme
        bonuses.laserChain = { chainFraction: effect.chainFraction };
        break;
      }
      case 'bossBonus': {
        // Tüm savunuculardan boss'lara ek hasar çarpanı
        bonuses.bossBonus = (bonuses.bossBonus || 0) + effect.value;
        break;
      }
      case 'incomeMultiplier': {
        // Tüm geliri çarpan (soul + meta) — economy multiplier üzerine ek katman
        bonuses.incomeMultiplier = (bonuses.incomeMultiplier || 0) + effect.value;
        break;
      }
    }
  },

  /** Tüm açılmış node'ların efektlerini yeniden uygula (load sonrası). */
  reapplyAllEffects() {
    GameState.conquestMap.bonuses = {};
    for (const nodeId of GameState.conquestMap.unlockedNodes) {
      const node = CONFIG.CONQUEST_NODES[nodeId];
      if (node) this.applyEffect(node.effect);
    }
  },

  /** Belirli bir defender tipi için toplam conquest bonus çarpanını al. */
  getDefenderBonus(defenderType, statName) {
    const bonuses = GameState.conquestMap.bonuses;
    let total = 0;
    // Defender-spesifik bonus
    if (bonuses.defenderBoost?.[defenderType]?.[statName]) {
      total += bonuses.defenderBoost[defenderType][statName];
    }
    // Global bonus
    if (bonuses.globalBonus?.[statName]) {
      total += bonuses.globalBonus[statName];
    }
    return total; // 0.25 = +25%
  },

  /** Ekonomi çarpanını al (economy + incomeMultiplier katmanları dahil). */
  getEconomyMultiplier(stat) {
    const bonuses = GameState.conquestMap.bonuses;
    const base = 1 + (bonuses.economy?.[stat] || 0);
    const income = 1 + (bonuses.incomeMultiplier || 0);
    return base * income;
  },

  /** Boss'lara ek hasar çarpanı (1 + bonus). */
  getBossBonus() {
    return 1 + (GameState.conquestMap.bonuses.bossBonus || 0);
  },

  /** Archer splash konfigürasyonu — null ise aktif değil. */
  getArcherSplash() {
    return GameState.conquestMap.bonuses.archerSplash || null;
  },

  /** Laser chain konfigürasyonu — null ise aktif değil. */
  getLaserChain() {
    return GameState.conquestMap.bonuses.laserChain || null;
  },

  /** Tüm node bilgilerini getir (UI için). */
  getAllNodesInfo() {
    return Object.values(CONFIG.CONQUEST_NODES).map(node => ({
      ...node,
      unlocked: this.isUnlocked(node.id),
      available: this.isAvailable(node.id),
      canPurchase: this.canPurchase(node.id),
    }));
  },
};

export default ConquestManager;
