import { CONFIG } from '../config.js';
import GameState from '../state/GameState.js';

/**
 * SoulDebtManager — Birim diriltmenin üç katmanlı cezasını yönetir (K11/K33, DESIGN 6.4).
 *
 * Soul ve soul-debt İKİ AYRI sayaçtır:
 *  - Soul = kaynak (GameState.resources.soul). Diriltme bundan harcar.
 *  - Soul-debt = ceza sayacı (GameState.soulDebt.current). Soul'dan DÜŞMEZ; ayrı birikir.
 *    Yalnız sonraki diriltmeleri pahalılaştırır: maliyet = taban × (1 + debt/debtScale).
 *
 * Üç ceza (diriltme başına):
 *  1. Anlık soul maliyeti (taban × borç çarpanı)
 *  2. Cooldown (ölen birim reviveCooldown sn sonra kalkar)
 *  3. Artan borç (debtPerCapacity × kapasite); zamanla + kill ile erir
 *
 * Koşu-içidir (prestige'de GameState.soulDebt sıfırlanır — K33 model A).
 * Hat ihlali borç YAZMAZ (yalnız can — K33); borç yalnız BİRİM diriltmeden gelir.
 *
 * FAZ D DURUMU: Sistem tam kurulu, ama "birim öldü → dirilt" tetiği Faz E'de (dur-dövüş +
 * gerçek birim ölümü) bağlanır. onUnitDeath(unit) + processQueue() API'si hazır bekler.
 */
const SoulDebtManager = {
  _queue: [],       // diriltme kuyruğu: [{ unit, timer }] — FIFO (K29)
  _scene: null,

  /** GameScene başlangıcında çağrılır; kuyruğu temizler. */
  init(scene) {
    this._scene = scene;
    this._queue = [];
  },

  // ─────────── Borç (soul-debt) ───────────

  getDebt() {
    return GameState.soulDebt?.current || 0;
  },

  /** Borç çarpanı: 1 + debt/debtScale, debtMaxMultiplier ile sınırlı. */
  getDebtMultiplier() {
    const sd = CONFIG.SOUL_DEBT;
    const mult = 1 + this.getDebt() / sd.debtScale;
    return Math.min(mult, sd.debtMaxMultiplier);
  },

  /** Bir birimin diriltme soul maliyeti = kapasite × katsayı × borç çarpanı (K12). */
  getReviveCost(unit) {
    const cap = this._capacityOf(unit);
    const sd = CONFIG.SOUL_DEBT;
    return Math.ceil(cap * sd.reviveCostPerCapacity * this.getDebtMultiplier());
  },

  /** Birimin soul-kapasitesi (config'den; yoksa güvenli varsayılan). */
  _capacityOf(unit) {
    const type = unit?.type;
    return CONFIG.DEFENDERS[type]?.soulCapacity ?? 10;
  },

  /** Borç ekle (yalnız diriltmeden — K33). */
  _addDebt(amount) {
    if (!GameState.soulDebt) GameState.soulDebt = { current: 0 };
    GameState.soulDebt.current += amount;
  },

  /** Borcu azalt (zaman erimesi + kill); 0'ın altına inmez. */
  reduceDebt(amount) {
    if (!GameState.soulDebt) return;
    GameState.soulDebt.current = Math.max(0, GameState.soulDebt.current - amount);
  },

  /** Her düşman öldürmede çağrılır — "ruh hasat ederek borç öde" (K33). */
  onEnemyKilled() {
    this.reduceDebt(CONFIG.SOUL_DEBT.debtDecayPerKill);
  },

  // ─────────── Diriltme ───────────

  /**
   * Bir birim öldü — otomatik diriltme kuyruğuna al (K29 oto-taban, AFK güvenli).
   * FAZ E'de dur-dövüş birim ölümünde bunu çağıracak. Soul yetmezse kuyrukta bekler
   * (her tick'te yeniden denenir); cooldown dolunca ve soul varsa diriltilir.
   * @param {object} unit — ölen birim (type + konum taşır; pool'a dönmemiş olmalı)
   */
  onUnitDeath(unit) {
    if (!unit) return;
    this._queue.push({ unit, timer: CONFIG.SOUL_DEBT.reviveCooldown });
  },

  /**
   * Her frame çağrılır: cooldown'ları işletir, dolanları (soul yeterse) diriltir (FIFO).
   * Soul yetmeyen baştaki iş kuyruğu bloklar (FIFO sözleşmesi) — ama diğerlerinin cooldown'u
   * yine de akar; soul gelince sırayla dirilirler.
   */
  update(delta) {
    if (this._queue.length === 0) return;
    for (const job of this._queue) {
      if (job.timer > 0) job.timer -= delta;
    }
    // FIFO: yalnız baştaki iş hazır + karşılanabiliyorsa diriltilir
    const head = this._queue[0];
    if (head && head.timer <= 0) {
      const cost = this.getReviveCost(head.unit);
      if (GameState.resources.soul >= cost) {
        this._doRevive(head.unit, cost);
        this._queue.shift();
      }
      // soul yetmezse kuyrukta bekler (bir sonraki tick yeniden dener)
    }
  },

  /** Diriltmeyi uygula: soul harca (ceza 1) + borç yükle (ceza 3). */
  _doRevive(unit, cost) {
    GameState.resources.soul -= cost;
    this._addDebt(this._capacityOf(unit) * CONFIG.SOUL_DEBT.debtPerCapacity);
    // Birimi fiilen ayağa kaldırmak Faz E'nin işi (unit.revive()/respawn); şimdilik olay yay.
    if (typeof unit.revive === 'function') unit.revive();
    this._scene?.events?.emit('unit-revived', { type: unit.type, cost });
  },

  /** Diriltme kuyruğunda kaç iş var (UI/debug). */
  getQueueLength() {
    return this._queue.length;
  },
};

export default SoulDebtManager;
