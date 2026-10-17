import GameState from '../state/GameState.js';
import { CONFIG } from '../config.js';

/**
 * IdleManager — Offline gelir hesaplama.
 *
 * Gerçekçi model: idle geliri, oyuncunun oynarken ÖLÇÜLEN gerçek kazanım
 * hızına (GameState.meta.soulRate / metaRate) dayanır. Bu hız gerçek DPS,
 * upgrade'ler, wave ve tüm çarpanları (prestige/conquest/ekonomi) zaten
 * içerir — bu yüzden burada tekrar çarpan uygulanmaz, sadece verimlilik.
 */
const IdleManager = {
  calculateIdleEarnings() {
    const lastSave = GameState.meta.lastSaveTime;
    if (!lastSave) return null;

    const now = Date.now();
    let elapsedMs = now - lastSave;
    if (elapsedMs < 60000) return null; // 1 dakikadan kısa — idle yok

    const maxMs = CONFIG.MAX_IDLE_HOURS * 3600 * 1000;
    if (elapsedMs > maxMs) elapsedMs = maxMs;
    const elapsedSeconds = elapsedMs / 1000;

    const soulRate = GameState.meta.soulRate || 0;
    const metaRate = GameState.meta.metaRate || 0;
    const soul = Math.floor(soulRate * elapsedSeconds * CONFIG.IDLE_EFFICIENCY);
    const meta = Math.floor(metaRate * elapsedSeconds * CONFIG.IDLE_EFFICIENCY);

    if (soul <= 0 && meta <= 0) return null; // henüz ölçülmüş hız yok

    return { elapsedSeconds, soul, meta };
  },

  applyEarnings(earnings) {
    GameState.resources.soul += earnings.soul;
    GameState.resources.bone += earnings.meta;
    GameState.stats.totalSoulEarned += earnings.soul;
    GameState.stats.totalMetaEarned += earnings.meta;
  },
};

export default IdleManager;
