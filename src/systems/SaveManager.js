import GameState, { resetAll } from '../state/GameState.js';
import { CONFIG } from '../config.js';
import ConquestManager from './ConquestManager.js';

/**
 * SaveManager — localStorage otomatik kayıt/yükleme + sürüm migration'ı.
 * 30 saniyede bir oto-kayıt, beforeunload'da son kayıt.
 */
const SAVE_KEY = 'idle-kingdom-defense-save';

/**
 * Save şema migration'ları. Anahtar = kaynak sürüm; fonksiyon o sürümdeki
 * gameState'i BİR SONRAKİ sürüme yükseltir ve döndürür.
 *
 * Şemayı (GameState şeklini) değiştirince yapılacak:
 *   1) CONFIG.SAVE_VERSION'ı +1 artır
 *   2) buraya eski sürüm numarasıyla bir migration adımı ekle
 * Böylece eski kayıtlar sessizce bozulmak yerine güncel şekle taşınır.
 */
const MIGRATIONS = {
  // v1 → v2: bu oturumda eklenen alanları garanti et
  1: (gs) => {
    if (!gs.settings) gs.settings = { soundEnabled: true, masterVolume: 0.5 };
    if (!gs.achievements) gs.achievements = { unlocked: [] };
    if (!gs.stats) gs.stats = {};
    if (gs.stats.bossesKilled == null) gs.stats.bossesKilled = 0;
    return gs;
  },
  // v2 → v3: ölçülen kazanım hızı alanları
  2: (gs) => {
    if (!gs.meta) gs.meta = {};
    if (gs.meta.soulRate == null) gs.meta.soulRate = 0;
    if (gs.meta.metaRate == null) gs.meta.metaRate = 0;
    return gs;
  },
  // v3 → v4: ekonomi upgrade seviyeleri
  3: (gs) => {
    if (!gs.economy) gs.economy = { soulBoost: { level: 0 }, metaBoost: { level: 0 } };
    return gs;
  },
  // v4 → v5: frost + catapult defender state alanları
  4: (gs) => {
    if (!gs.defenders) gs.defenders = {};
    if (!gs.defenders.frost)    gs.defenders.frost    = { unlocked: false, canBeHired: false, count: 0, maxCount: 3, damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 } };
    if (!gs.defenders.catapult) gs.defenders.catapult = { unlocked: false, canBeHired: false, count: 0, maxCount: 2, damage: { level: 1 }, blastRadius: { level: 1 }, reloadSpeed: { level: 1 } };
    return gs;
  },
  // v5 → v6: EXP/Food ekonomisi → Soul + 3 meta (Soul Debt). Eski ekonomi şeması
  // uyumsuz; ekonomi alanları temiz başlangıca sıfırlanır (DESIGN 11, MIGRATION §9).
  5: (gs) => {
    gs.resources = { soul: 0, bone: 0, essence: 0, crystal: 0 };
    gs.lifetimeSoul = 0;
    gs.economy = { soulBoost: { level: 0 }, metaBoost: { level: 0 } };
    if (!gs.meta) gs.meta = {};
    gs.meta.soulRate = 0; gs.meta.metaRate = 0; gs.meta.onboardingSeen = false;
    if (gs.stats) { gs.stats.totalSoulEarned = 0; gs.stats.totalMetaEarned = 0; }
    // conquest node'ları da sıfırla (maliyetler/effect'ler yeni şemaya geçti)
    gs.conquestMap = { unlockedNodes: [], bonuses: {} };
    return gs;
  },
  // v6 → v7: necromancer can havuzu (Faz C). Eski save'lerde yoktu; varsayılanla ekle.
  6: (gs) => {
    if (!gs.necromancer) gs.necromancer = { hp: 100, maxHp: 100, maxHpLevel: 0 };
    return gs;
  },
};

const SaveManager = {
  _intervalId: null,

  /** Oyunu localStorage'a kaydet. */
  save() {
    try {
      GameState.meta.lastSaveTime = Date.now();
      GameState.meta.saveVersion = CONFIG.SAVE_VERSION;
      const data = {
        version: CONFIG.SAVE_VERSION, // şema sürümü — yüklerken migration için
        timestamp: Date.now(),
        gameState: JSON.parse(JSON.stringify(GameState)),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Save failed:', e);
      return false;
    }
  },

  /** Kayıtlı oyun var mı? */
  hasSave() {
    try {
      return !!localStorage.getItem(SAVE_KEY);
    } catch (e) {
      return false;
    }
  },

  /** localStorage'dan yükle. Yoksa null döner. */
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !data.gameState) return null;
      return data;
    } catch (e) {
      console.warn('Load failed:', e);
      return null;
    }
  },

  /** Eski save'i güncel şemaya taşır (sürüm migration'ı). */
  _migrate(data) {
    let v = Number(data.version) || 1;
    let gs = data.gameState || {};
    while (v < CONFIG.SAVE_VERSION) {
      const step = MIGRATIONS[v];
      if (step) gs = step(gs) || gs;
      v++;
    }
    data.gameState = gs;
    data.version = v;
    return data;
  },

  /** Kaydedilmiş state'i güncel şemaya taşıyıp GameState'e uygular. */
  applyLoad(savedData) {
    try {
      const migrated = this._migrate(savedData);
      const gs = migrated.gameState || {};
    // Resources — 4 kaynak (soul + 3 meta). v6 ekonomisi; eksik yükleme bug'ı giderildi.
    GameState.resources.soul    = gs.resources?.soul    || 0;
    GameState.resources.bone    = gs.resources?.bone    || 0;
    GameState.resources.essence = gs.resources?.essence || 0;
    GameState.resources.crystal = gs.resources?.crystal || 0;
    GameState.lifetimeSoul = gs.lifetimeSoul || 0; // onboarding tetiği (K19)
    // Necromancer can havuzu (K10/K13)
    if (gs.necromancer) Object.assign(GameState.necromancer, gs.necromancer);
    // Wave
    Object.assign(GameState.wave, gs.wave || {});
    // Defenders
    if (gs.defenders) {
      for (const type of ['laser', 'archer', 'cannon', 'frost', 'catapult']) {
        if (gs.defenders[type]) {
          Object.assign(GameState.defenders[type], gs.defenders[type]);
        }
      }
    }
    // Conquest Map
    if (gs.conquestMap) {
      GameState.conquestMap.unlockedNodes = gs.conquestMap.unlockedNodes || [];
      GameState.conquestMap.bonuses = gs.conquestMap.bonuses || {};
    }
    // Prestige
    if (gs.prestige) {
      Object.assign(GameState.prestige, gs.prestige);
    }
    // Settings (ses) — eski save'lerde olmayabilir
    if (gs.settings) {
      Object.assign(GameState.settings, gs.settings);
    }
    // Başarımlar
    if (gs.achievements) {
      GameState.achievements.unlocked = gs.achievements.unlocked || [];
    }
    // Stats
    if (gs.stats) {
      Object.assign(GameState.stats, gs.stats);
    }
    // Meta
    if (gs.meta) {
      Object.assign(GameState.meta, gs.meta);
    }

    // Conquest bonuslarını yeniden uygula
    ConquestManager.reapplyAllEffects();
      return true;
    } catch (e) {
      console.warn('Load/migrate başarısız — temiz başlangıç:', e);
      resetAll(GameState);
      return false;
    }
  },

  /** Otomatik kayıt başlat. */
  startAutoSave() {
    if (this._intervalId) return;
    this._intervalId = setInterval(() => this.save(), CONFIG.SAVE_INTERVAL);

    // beforeunload — son kayıt
    window.addEventListener('beforeunload', () => this.save());
  },

  /** Otomatik kaydı durdur. */
  stopAutoSave() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },

  /** Save sil (debug/reset için). */
  deleteSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.warn('Delete save failed:', e);
    }
  },
};

export default SaveManager;
