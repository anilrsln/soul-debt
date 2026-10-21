import { CONFIG } from '../config.js';

/**
 * AssetProvider — CONFIG.ASSETS manifestini Phaser texture'larına çevirir.
 */

/** Oyun mantığında kullanılacak ekran boyutları (px) */
const DISPLAY_SIZES = {
  // enemies
  'enemy-ghoul':       { w: 48, h: 48 },
  'enemy-gargoyle':        { w: 54, h: 54 },
  'enemy-imp':           { w: 42, h: 42 },
  'enemy-soulVessel':    { w: 50, h: 50 },
  'enemy-cursedKnight':          { w: 64, h: 64 },
  'enemy-warden':         { w: 54, h: 54 },
  'enemy-ooze':       { w: 50, h: 50 },
  'enemy-cultist':         { w: 48, h: 48 },
  'enemy-boss_tank':      { w: 88, h: 88 },
  'enemy-boss_berserker': { w: 100, h: 100 },
  'enemy-boss_shaman':    { w: 92, h: 92 },
  'enemy-boss_splitter':  { w: 104, h: 104 },
  'enemy-boss_armored':   { w: 96, h: 96 },
  // defenders
  'defender-necromancer':       { w: 56, h: 68 },  // 192px sheet → oyunda ~dik figür
  'defender-archer':      { w: 54, h: 54 },   // 96px sheet → oyunda ~54px
  'defender-golem':      { w: 66, h: 66 },  // EN iri tank (112px sheet)
  'defender-mage':       { w: 28, h: 48 },
  'defender-bruiser':    { w: 56, h: 56 },    // 96px sheet → oyunda ~56px (ön-saf, biraz iri)
  'defender-cleric':     { w: 28, h: 48 },
  // projectiles
  'projectile-arrow':     { w: 1, h: 1 },
};

/**
 * Animasyon tanımları — her key için bir veya BİRDEN ÇOK durum (state).
 *
 * İki şema desteklenir (geriye-uyumlu):
 *  1. TEK DURUM (eski): { frameCount, frameRate, flipX } → yalnız 'idle' gibi davranır.
 *  2. ÇOK DURUM (yeni): { flipX, states: { idle:{start,count,frameRate,loop}, walk:{...}, ... } }
 *     Tek sprite sheet'te durumlar ARDIŞIK frame bloklarıdır (idle 0..5, walk 6..13, ...);
 *     her state kendi {start, count} aralığıyla kesilir. loop:false → tek sefer oynar (attack/hurt/death).
 *
 * Frame SAYILARI ve BOYUT sabit değil — config'den okunur (Anıl: esnek). ChatGPT sheet'i ne
 * üretirse buraya o start/count yazılır. Önerilen aralıklar ASSET-BRIEF.md'de.
 *
 * NOT: Aşağısı PLACEHOLDER tek-durum tanımlarıdır (mevcut klon sheet'leri idle-only). Gerçek
 * çok-durumlu sheet'ler gelince ilgili key'e `states` eklenir; kod otomatik devralır.
 */
const ANIM_DEFS = {
  'enemy-ghoul':          { frameCount: 6, frameRate: 8,  flipX: true },
  'enemy-gargoyle':       { frameCount: 6, frameRate: 7,  flipX: true },
  'enemy-imp':            { frameCount: 6, frameRate: 12, flipX: true },
  'enemy-soulVessel':     { frameCount: 6, frameRate: 8,  flipX: true },
  'enemy-cursedKnight':   { frameCount: 6, frameRate: 7,  flipX: true },
  'enemy-warden':         { frameCount: 6, frameRate: 7,  flipX: true },
  'enemy-ooze':           { frameCount: 6, frameRate: 9,  flipX: true },
  'enemy-cultist':        { frameCount: 6, frameRate: 8,  flipX: true },
  'enemy-boss_tank':      { frameCount: 6, frameRate: 6,  flipX: true },
  'enemy-boss_berserker': { frameCount: 6, frameRate: 7,  flipX: true },
  'enemy-boss_shaman':    { frameCount: 6, frameRate: 7,  flipX: true },
  'enemy-boss_splitter':  { frameCount: 6, frameRate: 7,  flipX: true },
  'enemy-boss_armored':   { frameCount: 6, frameRate: 6,  flipX: true },
  // İskelet Okçu — çok-durumlu (96×96, 7 sütun grid; satır-başı: idle0 walk7 attack14 hurt21 death28)
  'defender-archer': {
    states: {
      idle:   { start: 0,  count: 5, frameRate: 6,  loop: true },
      walk:   { start: 7,  count: 7, frameRate: 10, loop: true },
      attack: { start: 14, count: 6, frameRate: 12, loop: false },
      hurt:   { start: 21, count: 4, frameRate: 12, loop: false },
      death:  { start: 28, count: 7, frameRate: 9,  loop: false },
    },
  },
  // Necromancer — çok-durumlu (192×192, 6 sütun grid; idle0 walk6 attack12 hurt18 death24)
  'defender-necromancer': {
    states: {
      idle:   { start: 0,  count: 6, frameRate: 6,  loop: true },
      walk:   { start: 6,  count: 6, frameRate: 9,  loop: true },
      attack: { start: 12, count: 6, frameRate: 10, loop: false },
      hurt:   { start: 18, count: 4, frameRate: 12, loop: false },
      death:  { start: 24, count: 6, frameRate: 8,  loop: false },
    },
  },
  // Taş Golem — çok-durumlu (112×112, 6 sütun grid; idle0 walk6 attack12 hurt18 death24). Ağır/yavaş.
  'defender-golem': {
    states: {
      idle:   { start: 0,  count: 6, frameRate: 5,  loop: true },
      walk:   { start: 6,  count: 6, frameRate: 7,  loop: true },
      attack: { start: 12, count: 6, frameRate: 9,  loop: false },
      hurt:   { start: 18, count: 4, frameRate: 10, loop: false },
      death:  { start: 24, count: 6, frameRate: 7,  loop: false },
    },
  },
  // İskelet Bruiser — çok-durumlu (96×96, 7 sütun grid)
  'defender-bruiser': {
    states: {
      idle:   { start: 0,  count: 5, frameRate: 6,  loop: true },
      walk:   { start: 7,  count: 7, frameRate: 11, loop: true },
      attack: { start: 14, count: 6, frameRate: 13, loop: false },
      hurt:   { start: 21, count: 4, frameRate: 12, loop: false },
      death:  { start: 28, count: 6, frameRate: 9,  loop: false },
    },
  },
};

/** Bir ANIM_DEF'i normalize et: hep { flipX, states:{...} } döndür (tek-durum → idle). */
function normalizeAnim(def) {
  if (!def) return null;
  if (def.states) return { flipX: !!def.flipX, states: def.states };
  // Eski tek-durum şeması → idle state'i
  return {
    flipX: !!def.flipX,
    states: { idle: { start: 0, count: def.frameCount, frameRate: def.frameRate, loop: true } },
  };
}

/** Oynatılacak durumu seç: istenen yoksa makul bir yedeğe düş (varsa idle, yoksa ilk state). */
function resolveState(states, wanted) {
  if (states[wanted]) return wanted;
  if (states.idle) return 'idle';
  return Object.keys(states)[0] || null;
}

const AssetProvider = {
  preload(scene) {
    for (const [key, spec] of Object.entries(CONFIG.ASSETS)) {
      if (!spec.sprite) continue;
      if (spec.frames) scene.load.spritesheet(key, spec.sprite, spec.frames);
      else scene.load.image(key, spec.sprite);
    }
  },

  /**
   * Spritesheet animasyonlarını Phaser anim manager'a kaydet (GameScene.create sonrası).
   * Her key için her STATE ayrı anim olur: Phaser key = '<spriteKey>-<state>' (örn 'enemy-ghoul-walk').
   */
  createAnims(scene) {
    for (const [key, rawDef] of Object.entries(ANIM_DEFS)) {
      const def = normalizeAnim(rawDef);
      if (!def) continue;
      for (const [state, s] of Object.entries(def.states)) {
        const animKey = `${key}-${state}`;
        if (scene.anims.exists(animKey)) continue;
        const start = s.start ?? 0;
        const end = start + (s.count ?? 1) - 1;
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(key, { start, end }),
          frameRate: s.frameRate ?? 8,
          repeat: s.loop === false ? 0 : -1, // loop:false → tek sefer (attack/hurt/death)
        });
      }
    }
  },

  createTextures(scene) {
    for (const [key, spec] of Object.entries(CONFIG.ASSETS)) {
      if (spec.sprite) continue;
      if (scene.textures.exists(key)) continue;
      this._generate(scene, key, spec);
    }
  },

  /**
   * Sprite'a doğru frame/boyut uygular.
   * @param {number} [childScale] — ooze child için 0..1 arası ek scale
   */
  applySprite(imageObj, key, childScale = 1) {
    const spec = CONFIG.ASSETS[key];
    if (!spec?.sprite) return;
    if (typeof imageObj.setFrame === 'function') {
      imageObj.setFrame(0);
    }
    const size = DISPLAY_SIZES[key];
    if (size) {
      imageObj.setDisplaySize(size.w * childScale, size.h * childScale);
    }
  },

  /**
   * Animasyonu oynat. state verilmezse 'idle'. Anim tanımı yoksa sessizce geçer (statik sprite).
   * İstenen state yoksa idle'a/ilk state'e düşer. Aynı state zaten oynuyorsa yeniden başlatmaz
   * (loop'u kesmemek için) — tek-sefer state'ler (loop:false) hep baştan oynatılır.
   * @returns {string|null} oynatılan state (çağıran bitişi dinlemek isteyebilir)
   */
  playAnim(sprite, key, state = 'idle') {
    if (!sprite || typeof sprite.play !== 'function') return null;
    const def = normalizeAnim(ANIM_DEFS[key]);
    if (!def) return null;
    const resolved = resolveState(def.states, state);
    if (!resolved) return null;
    const s = def.states[resolved];
    const animKey = `${key}-${resolved}`;
    const once = s.loop === false;
    // Döngüsel aynı anim zaten oynuyorsa dokunma (titremeyi önle)
    if (!once && sprite.anims?.isPlaying && sprite.anims.currentAnim?.key === animKey) {
      if (def.flipX) sprite.setFlipX(true);
      return resolved;
    }
    sprite.play(animKey, !once);
    if (def.flipX) sprite.setFlipX(true);
    return resolved;
  },

  /** Bir sprite key'inin belirli bir state'i tanımlı mı? (durum geçişi öncesi kontrol için). */
  hasState(key, state) {
    const def = normalizeAnim(ANIM_DEFS[key]);
    return !!(def && def.states[state]);
  },

  getDisplaySize(key) {
    return DISPLAY_SIZES[key] ?? null;
  },

  _generate(scene, key, spec) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(spec.color ?? 0xffffff, 1);
    switch (spec.shape) {
      case 'rect': {
        const w = spec.width, h = spec.height;
        g.fillRect(0, 0, w, h);
        g.generateTexture(key, w, h);
        break;
      }
      case 'triangle': {
        const s = spec.size;
        g.fillTriangle(s / 2, 0, 0, s, s, s);
        g.generateTexture(key, s, s);
        break;
      }
      case 'circle':
      default: {
        const r = spec.size;
        g.fillCircle(r, r, r);
        g.generateTexture(key, r * 2, r * 2);
        break;
      }
    }
    g.destroy();
  },
};

export default AssetProvider;
