/**
 * GameState.js — Merkezi durum yönetimi (singleton).
 * Tüm oyun verisi bu obje üzerinde tutulur.
 */
const GameState = {
  resources: { soul: 0, bone: 0, essence: 0, crystal: 0 },
  lifetimeSoul: 0, // toplam kazanılan soul (harcanmaz; onboarding tetiği — K19/5.3)
  // Necromancer can havuzu (K10/K13) — maxHpLevel soul ile artar; hp koşu-içi, kat sonu full dolar.
  necromancer: { hp: 100, maxHp: 100, maxHpLevel: 0 },
  soulDebt: { current: 0 }, // biriken ruh borcu (K11/K33) — koşu-içi; diriltme maliyetini çarpar
  wave: {
    current: 1, enemiesInWave: 5,
    enemiesSpawned: 0, enemiesKilled: 0, inProgress: true,
  },
  defenders: {
    necromancer: {
      damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 },
    },
    archer: {
      unlocked: false, count: 0, maxCount: 5,
      damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 },
    },
    golem: {
      unlocked: false, canBeHired: false, count: 0, maxCount: 3,
      damage: { level: 1 }, // melee: yalnız damage upgrade
    },
    mage: {
      unlocked: false, canBeHired: false, count: 0, maxCount: 3,
      damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 },
    },
    bruiser: {
      unlocked: false, canBeHired: false, count: 0, maxCount: 2,
      damage: { level: 1 }, // melee: yalnız damage upgrade
    },
    cleric: {
      unlocked: false, canBeHired: false, count: 0, maxCount: 2,
      heal: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 }, // support: heal/fireRate/range
    },
  },
  conquestMap: {
    unlockedNodes: [],
    bonuses: {
      // defenderBoost: { necromancer: { damage: 0 }, archer: { damage: 0 }, golem: { damage: 0 } }
      // globalBonus: { damage: 0 }
      // economy: { soulMultiplier: 0, metaMultiplier: 0 }
    },
  },
  economy: { soulBoost: { level: 0 }, metaBoost: { level: 0 } }, // run içi ekonomi upgrade'leri
  prestige: { count: 0, multiplier: 1.0 }, // unlocked alanı kaldırıldı (K26 — otomatik tetik, okunmuyordu)
  settings: { soundEnabled: true, masterVolume: 0.5 },
  stats: {
    totalEnemiesKilled: 0, totalSoulEarned: 0,
    totalMetaEarned: 0, totalWavesCompleted: 0, bossesKilled: 0,
    maxVeteranLevel: 0, unitsCancelled: 0, // Faz G achievement sayaçları (K37/K28)
  },
  achievements: { unlocked: [] },
  // soulRate/metaRate: oynarken ölçülen gerçek kazanım hızı (idle için kullanılır)
  meta: { lastSaveTime: Date.now(), totalPlayTime: 0, saveVersion: 6, soulRate: 0, metaRate: 0, onboardingSeen: false }, // saveVersion save anında CONFIG.SAVE_VERSION ile üzerine yazılır
};

/**
 * Tüm oynanışı sıfırdan başlatır (Yeni Oyun).
 * Kayıt + prestige dahil her şey sıfırlanır; yalnızca ses ayarları (settings) korunur.
 */
export function resetAll(state) {
  state.resources = { soul: 0, bone: 0, essence: 0, crystal: 0 };
  state.lifetimeSoul = 0;
  state.necromancer = { hp: 100, maxHp: 100, maxHpLevel: 0 };
  state.soulDebt = { current: 0 };
  state.wave = { current: 1, enemiesInWave: 5, enemiesSpawned: 0, enemiesKilled: 0, inProgress: true };
  state.defenders = {
    necromancer: { damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 } },
    archer: { unlocked: false, count: 0, maxCount: 5, damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 } },
    golem: { unlocked: false, canBeHired: false, count: 0, maxCount: 3, damage: { level: 1 } },
    mage: { unlocked: false, canBeHired: false, count: 0, maxCount: 3, damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 } },
    bruiser: { unlocked: false, canBeHired: false, count: 0, maxCount: 2, damage: { level: 1 } },
    cleric: { unlocked: false, canBeHired: false, count: 0, maxCount: 2, heal: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 } },
  };
  state.conquestMap = { unlockedNodes: [], bonuses: {} };
  state.economy = { soulBoost: { level: 0 }, metaBoost: { level: 0 } };
  state.prestige = { count: 0, multiplier: 1.0 };
  state.stats = { totalEnemiesKilled: 0, totalSoulEarned: 0, totalMetaEarned: 0, totalWavesCompleted: 0, bossesKilled: 0, maxVeteranLevel: 0, unitsCancelled: 0 };
  state.achievements = { unlocked: [] };
  state.meta = { ...state.meta, lastSaveTime: Date.now(), totalPlayTime: 0, soulRate: 0, metaRate: 0, onboardingSeen: false };
  // settings (ses) korunur; başarımlar Yeni Oyun'da sıfırlanır, prestige'de korunur
}

export function resetForPrestige(state) {
  state.resources = { soul: 0, bone: 0, essence: 0, crystal: 0 };
  // lifetimeSoul prestige'de sıfırlanır; onboardingSeen KORUNUR (onboarding bir kez olur)
  state.lifetimeSoul = 0;
  state.necromancer = { hp: 100, maxHp: 100, maxHpLevel: 0 };
  state.soulDebt = { current: 0 }; // borç koşu-içi: prestige'de sıfırlanır (K33 model A)
  state.wave = { current: 1, enemiesInWave: 5, enemiesSpawned: 0, enemiesKilled: 0, inProgress: true };
  state.defenders.necromancer = { damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 } };
  state.defenders.archer = { unlocked: false, count: 0, maxCount: 5, damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 } };
  state.defenders.golem = { unlocked: false, canBeHired: false, count: 0, maxCount: 3, damage: { level: 1 }, blastRadius: { level: 1 }, reloadSpeed: { level: 1 } };
  state.defenders.mage = { unlocked: false, canBeHired: false, count: 0, maxCount: 3, damage: { level: 1 }, fireRate: { level: 1 }, range: { level: 1 } };
  state.defenders.bruiser = { unlocked: false, canBeHired: false, count: 0, maxCount: 2, damage: { level: 1 }, blastRadius: { level: 1 }, reloadSpeed: { level: 1 } };
  state.conquestMap.unlockedNodes = [];
  state.economy = { soulBoost: { level: 0 }, metaBoost: { level: 0 } };
  state.meta.soulRate = 0; // prestige sonrası düşük DPS'e göre yeniden ölçülür
  state.meta.metaRate = 0;
}

export default GameState;
