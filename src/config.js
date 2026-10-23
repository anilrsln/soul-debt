/**
 * config.js — Tüm oyun sabitleri ve balans değerleri.
 * Magic number kullanmak yerine buradan import et.
 */
export const CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 500,

  // Sahne konumları
  WALL_X: 168,         // sur x'i (2x sur genisligi = 72px sola kaydi)
  CORRIDOR_TOP: 35,    // topbar (30px) hemen alti
  CORRIDOR_BOTTOM: 375,// alt UI panelinin (panelY=380) 5px ustunde biter
  SPAWN_X: 780,
  LANE_Y: 250,
  LANE_HEIGHT: 200,
  DEFENDER_X: 100,

  // Kaydetme
  SAVE_KEY: 'idle-kingdom-defense-save',
  SAVE_INTERVAL: 30000,
  SAVE_VERSION: 9, // save şema sürümü — v9: kadro rename (K22/K23) eski defender anahtarlarını map+temizle

  // Idle sistemi
  IDLE_EFFICIENCY: 0.5,
  MAX_IDLE_HOURS: 24,

  // Upgrade maliyet çarpanı
  UPGRADE_COST_MULTIPLIER: 1.15,

  // Ekonomi upgrade'leri (run içi, soul ile alınır; prestige/yeni oyunda sıfırlanır)
  // Çarpan = 1 + level × bonusPerLevel; maliyet = baseCost × costMultiplier^level
  ECONOMY_UPGRADES: {
    soulBoost: { name: 'Soul Boost', bonusPerLevel: 0.10, baseCost: 100, costMultiplier: 1.25 },
    metaBoost: { name: 'Meta Boost', bonusPerLevel: 0.10, baseCost: 150, costMultiplier: 1.30 },
  },

  // Debug / runtime tuning (yalnızca ?dev modunda dev panel üzerinden değişir)
  DEBUG: {
    timeScale: 1,       // oyun hızı çarpanı
    gainMultiplier: 1,  // test için soul/meta kazanç çarpanı
    jumpWaveTarget: 10, // "wave'e atla" hedefi
  },

  // Savaş: kritik vuruş.
  // NOT (K32): combo (kill-streak ödül çarpanı) Soul Debt kurgusuna aykırı olduğu için
  //   kaldırıldı (refleks ödülü; K4/K9 planlama kimliği + K12 soul matematiğiyle çelişir).
  //   crit PARK EDİLDİ: ekonomiye dokunmuyor (yalnız hasar varyansı), dur-dövüş savaş
  //   modeli (Faz E) oturunca tutulacak/değiştirilecek. Şimdilik çalışır halde bırakıldı.
  COMBAT: {
    crit: { chance: 0.15, multiplier: 2.0 }, // mermi savunucuları (archer/cannon) — PARK (bkz. K32)
    // Dur-dövüş (K8/K34): düşman birime çarpınca durur, karşılıklı HP tüketir.
    meleeRange: 22,       // düşman birime bu mesafede "temas" eder ve dur-dövüş başlar (px)
    meleeAttackRate: 1.0, // melee birim saniyede kaç kez vurur (dur-dövüşte)
    enemyAttackRate: 1.0, // düşman saniyede kaç kez vurur (dur-dövüşte)
    lungeRadius: 70,      // melee birim çıpasından bu mesafedeki düşmanı yakalamaya "lunge" eder (K34 cila)
    lungeSpeed: 180,      // lunge/geri-dönüş hareket hızı (px/sn)
    anchorRadius: 40,     // ankerli otonomi dairesi yarıçapı (K24 cila; ≈ekran-h/12 placeholder)
  },

  // Görsel efekt (juice) anahtarları
  FX: {
    screenShake: true,  // cannon patlaması / elite ölümünde kamera sarsıntısı
    hitFlash: true,     // mermi isabetinde düşman beyaz flash
  },

  // Başarımlar — check(g) runtime'da GameState (g) üzerinden değerlendirilir
  ACHIEVEMENTS: {
    firstKill:     { name: "İlk Kan",        desc: "İlk düşmanı öldür",        check: (g) => g.stats.totalEnemiesKilled >= 1 },
    kill100:       { name: "Temizlikçi",     desc: "100 düşman öldür",         check: (g) => g.stats.totalEnemiesKilled >= 100 },
    kill1000:      { name: "Kıyım",          desc: "1.000 düşman öldür",       check: (g) => g.stats.totalEnemiesKilled >= 1000 },
    wave25:        { name: "Dayanıklı",      desc: "25. dalgaya ulaş",         check: (g) => g.wave.current >= 25 },
    wave50:        { name: "Kuşatma",        desc: "50. dalgaya ulaş",         check: (g) => g.wave.current >= 50 },
    wave100:       { name: "Efsane",         desc: "100. dalgaya ulaş",        check: (g) => g.wave.current >= 100 },
    firstBoss:     { name: "Dev Avcısı",     desc: "İlk boss'u yen",           check: (g) => g.stats.bossesKilled >= 1 },
    firstPrestige: { name: "Yeniden Doğuş",  desc: "İlk prestige'i yap",       check: (g) => g.prestige.count >= 1 },
    prestige5:     { name: "Ölümsüz",        desc: "5 kez prestige yap",       check: (g) => g.prestige.count >= 5 },
    golemUnlock:   { name: "Golemci",        desc: "Golem'i aç",               check: (g) => g.defenders.golem.canBeHired === true },
    archerFull:    { name: "Okçu Ordusu",    desc: "Maksimum okçuya ulaş",     check: (g) => g.defenders.archer.count >= g.defenders.archer.maxCount },
    allNodes:      { name: "Fetih",          desc: "Tüm Conquest node'larını aç", check: (g) => g.conquestMap.unlockedNodes.length >= Object.keys(CONFIG.CONQUEST_NODES).length },
    richExp:       { name: "Zengin",         desc: "1M toplam Soul kazan",     check: (g) => g.stats.totalSoulEarned >= 1e6 },
    // Faz G — veteran/diriltme/kat temalı (K37/K28)
    veteran5:      { name: "Gazi",           desc: "Bir birimi Kıdem 5'e ulaştır", check: (g) => (g.stats.maxVeteranLevel || 0) >= 5 },
    firstCancel:   { name: "Merhametsiz",    desc: "Bir dirilişi iptal et",    check: (g) => (g.stats.unitsCancelled || 0) >= 1 },
    floor3:        { name: "Derine İniş",    desc: "3. kata ulaş",             check: (g) => Math.ceil(g.wave.current / (CONFIG.PRESTIGE?.wavesPerFloor || 10)) >= 3 },
  },

  // Renk paleti
  COLORS: {
    WALL: 0x4a4a6a, WALL_TOP: 0x5a5a7a,
    GROUND: 0x111120, GROUND_LIGHT: 0x2a2a48, GROUND_EDGE: 0x33335a,
    SKY: 0x1a1a2e, SKY_TOP: 0x15152a, SKY_BOTTOM: 0x1b1b33,
    LASER: 0x00ffff, ARCHER: 0x7cfc00, CANNON: 0xff8c00,
    ENEMY_SKELETON: 0xcccccc, ENEMY_ARMORED: 0x888888,
    ENEMY_FAST: 0xff6666, ENEMY_FOOD: 0x66ff66, ENEMY_ELITE: 0xffaa00,
    HP_BAR_BG: 0x333333, HP_BAR_FILL: 0x00ff00, HP_BAR_LOW: 0xff0000,
    UI_BG: 0x16213e, UI_TEXT: 0xffffff, UI_ACCENT: 0xe94560,
    UI_GOLD: 0xffd700, UI_BUTTON: 0x0f3460,
    UI_BUTTON_HOVER: 0x1a4a7a, UI_BUTTON_DISABLED: 0x333333,
  },

  // Necromancer — oyunun başlangıç birimi (K25). Sabit konumlu, menzilli, hep sahnede.
  // Can havuzu (K10/K13): hat ihlalinde (breachLine) canından kesilir; 0'da koşu biter.
  // NOT: Bu NECROMANCER bloğu necromancer'ın CAN havuzu/upgrade statlarıdır; menzilli saldırı
  //   statları DEFENDERS.necromancer altında (eski 'laser' anahtarı K23 ile temizlendi).
  NECROMANCER: {
    maxHp:        { base: 100, perLevel: 50, baseCost: 80, costMultiplier: 1.25 }, // soul ile maxHp upgrade kolu (K10)
    breachDamage: 10,   // hat ihlali başına necromancer canından sabit kesinti (placeholder; K13)
                        // Faz D: düşman-orantılı breach hasarı (K12) soul-debt ile birlikte eklenecek
    floorHealFull: true, // her 10 wave (kat sonu) necromancer canı full dolar (K7/K10)
  },

  // Soul-Debt — birim diriltmenin üç katmanlı cezası (K11/K33). Soul'dan AYRI bir sayaç:
  // diriltme hem soul harcar hem borç yükler; borç yalnız sonraki diriltmeleri pahalılaştırır.
  // Koşu-içi (prestige'de sıfırlanır — K33 model A). Hat ihlali borç YAZMAZ (yalnız can — K33).
  SOUL_DEBT: {
    reviveCostPerCapacity: 2.5, // taban diriltme maliyeti = birim.soulCapacity × bu (K12: güçlü birim pahalı)
    reviveCooldown: 2.0,        // sn — ölen birim bu süre sonra kalkar (K11 ikinci ceza)
    debtPerCapacity: 1.0,       // her diriltme borcu += soulCapacity × bu (güçlü birim = çok borç)
    debtScale: 200,             // maliyet çarpanı = 1 + debt / debtScale (borç ölçeği)
    debtMaxMultiplier: 5,       // diriltme maliyet çarpanı tavanı (borç ne olursa olsun ×5'i geçmez)
    debtDecayPerSecond: 3,      // borç saniyede bu kadar pasif erir
    debtDecayPerKill: 2,        // her düşman öldürmede borç bu kadar azalır ("ruh hasat et, borç öde")
  },

  // Veteran (kıdem) sistemi — K37. Birim-başına ilerleme: tip-level'ının ÜSTÜNE çarpan.
  // Soul-bazlı: kazanılan soul sahadaki canlı birimlere EŞİT pay edilir (gerçek ekonomiden DÜŞMEZ,
  // paralel sayaç). Diriltme kıdemi KORUR, iptal/kalıcı ölüm SIFIRLAR → diriltmenin anlamı budur.
  VETERAN: {
    soulToXpRate: 1.0,     // kazanılan soul'un ne kadarı kıdem-tecrübesine sayılır (1.0 = birebir paylaşılır)
    baseThreshold: 100,    // seviye 1→2 için gereken veteranSoul
    thresholdGrowth: 1.6,  // her seviye eşiği bir öncekinin bu katı (üstel — kendiliğinden frenler, sert tavan yok)
    // Seviye başına bonus oranları birim config'inden gelir (veteranBonus). Buradaki yoksa-varsayılan:
    defaultBonus: { damage: 0.08, hp: 0.06, special: 0.05 }, // kıdem başına +%; birim override edebilir
  },

  // Savunucu başlangıç değerleri
  DEFENDERS: {
    // 'necromancer' anahtarı (K25/K23: eski 'laser' temizlendi). Damage/range/fireRate
    // necromancer'ın menzilli saldırı statları; can ayrı (CONFIG.NECROMANCER + GameState.necromancer).
    necromancer: {
      name: 'Necromancer',
      combatType: 'ranged', hp: 9999, // necromancer canı ayrı yönetilir (GameState.necromancer)
      // NOT: necromancer kendi entity'si (Necromancer.js) ile çizilir; registry'ye dahil DEĞİL.
      // Davranış alanları (projectileType vb.) burada tutulmaz — hire edilmez.
      damage:   { base: 5,  multiplier: 1.2,  baseCost: 10 },
      fireRate: { base: 1.2, multiplier: 1.1, baseCost: 15 },
      range:    { base: 150, multiplier: 1.08, baseCost: 20 },
      // Hedef kilidi (K35): seçtiği hedefi ölene/menzilden çıkana kadar vurur (zıplama yok).
      // İstisna: necromancer'a bu mesafeden yakın düşman belirirse kilit kırılır (can havliyle
      // son-savunma müdahalesi). px cinsinden; necromancer'ın x'ine yatay yakınlık.
      emergencyThreatDist: 70,
    },
    archer: {
      name: 'Archer',
      combatType: 'ranged', hp: 30, // ranged: çıpada sabit, menzilden vurur (K34)
      // Davranış (veri-odaklı; tek Defender sınıfı bunları okur):
      spriteKey: 'defender-archer', spriteType: 'sprite', // animasyonlu sprite
      projectileType: 'arrow', fireSfx: 'archerFire', fireFx: 'recoil',
      archerSplash: true, // Conquest "Archer Mastery" splash kancası (ConquestManager'dan okunur)
      soulCapacity: 6, // düşük — ucuz dirilt, düşük borç (K12/K22 İskelet Okçu)
      // K30 placeholder: soul + bone (İskelet Okçu benzeri)
      craftCost: { soul: 50, bone: 10 }, craftCostMultiplier: 1.5,
      hireCost: 50,
      hireCostMultiplier: 1.5,
      damage:   { base: 3,  multiplier: 1.2,  baseCost: 12 },
      fireRate: { base: 0.8, multiplier: 1.1, baseCost: 18 },
      range:    { base: 120, multiplier: 1.08, baseCost: 25 },
    },
    golem: {
      name: 'Stone Golem',
      combatType: 'melee', hp: 120, // melee TIKAÇ: yolu tutar, dur-dövüş (K34 asıl tank)
      // Melee: mermi yok. Davranış alanları:
      spriteKey: 'defender-golem', spriteType: 'sprite',
      fireFx: 'blast', // (melee olduğu için ateş efekti şu an çağrılmıyor; ileride ranged varyant için korunur)
      soulCapacity: 20, // yüksek — pahalı dirilt, çok borç (K12/K22 Taş Golem benzeri)
      // K30 placeholder: soul + essence (Golem benzeri ağır birim)
      craftCost: { soul: 200, essence: 8 }, craftCostMultiplier: 2.0,
      hireCost: 200,
      hireCostMultiplier: 2.0,
      // Melee: yalnız damage upgrade edilebilir (blastRadius/reloadSpeed mermiye aitti — kaldırıldı).
      damage:      { base: 15, multiplier: 1.25, baseCost: 30 },
    },
    mage: {
      name: 'Damage Mage',
      combatType: 'ranged', hp: 40, // ranged AoE hasar büyücüsü (K22; yavaşlatma→AoE'ye evrilecek)
      spriteKey: 'defender-mage', spriteType: 'image',
      projectileType: 'mageBolt', fireSfx: 'mageFire', fireFx: 'chill',
      onHitEffect: 'slow', // şimdilik yavaşlatma; K22 gereği ileride AoE hasara evrilecek
      soulCapacity: 12, // orta (K12/K22 Büyücü)
      // K30 placeholder: soul + bone + essence (çok-metalı — Büyücü benzeri)
      craftCost: { soul: 300, bone: 15, essence: 5 }, craftCostMultiplier: 1.8,
      hireCost: 300,
      hireCostMultiplier: 1.8,
      // Hasar düşük; asıl değer yavaşlatma
      damage:       { base: 2,   multiplier: 1.15, baseCost: 20 },
      fireRate:     { base: 0.6, multiplier: 1.1,  baseCost: 22 },
      range:        { base: 130, multiplier: 1.08, baseCost: 28 },
      // Yavaşlatma: hedef hızını slowFraction'a düşürür, slowDuration sn sonra normale döner
      slowFraction: 0.45, // hedef hızının %45'ine iner
      slowDuration: 2.5,  // saniye
    },
    bruiser: {
      name: 'Skeleton Bruiser',
      combatType: 'melee', hp: 70, // melee TIKAÇ ön-saf (K22): golem'den dayanıksız ama hızlı+vurucu
      // Melee: mermi yok. Golem'den rol farkı: orta HP, yüksek hasar, HIZLI vuruş.
      spriteKey: 'defender-bruiser', spriteType: 'sprite',
      fireFx: 'blast',
      meleeAttackRate: 1.8, // golem'in global 1.0'ından hızlı — bruiser'ın kimliği (ön-saf vurucu)
      soulCapacity: 14, // golem'den (20) ucuz dirilt; orta borç (K12)
      // K30 placeholder: soul + bone (ön-saf iskelet — golem'in essence'ından ayrışır)
      craftCost: { soul: 350, bone: 25 }, craftCostMultiplier: 2.2,
      hireCost: 350,
      hireCostMultiplier: 2.2,
      damage:      { base: 22, multiplier: 1.28, baseCost: 40 }, // golem (15) üstü vuruş gücü
    },
    cleric: {
      name: 'Cleric',
      combatType: 'support', hp: 35, // destek: savaşmaz, menzildeki dost birimleri iyileştirir (K22 healer)
      spriteKey: 'defender-cleric', spriteType: 'sprite',
      fireFx: 'heal', // yeşil pulse (fire değil, heal tetiğinde)
      soulCapacity: 12, // orta (K12)
      // K30 placeholder: soul + essence (büyücü ailesi — mage ile benzer)
      craftCost: { soul: 400, essence: 6 }, craftCostMultiplier: 2.0,
      hireCost: 400,
      hireCostMultiplier: 2.0,
      // Support statları: heal gücü (damage yerine), fireRate = heal sıklığı, range = menzil
      heal:     { base: 8,   multiplier: 1.25, baseCost: 35 }, // iyileştirme/pulse (upgrade stat)
      fireRate: { base: 0.5, multiplier: 1.1,  baseCost: 25 }, // saniyede heal pulse sayısı
      range:    { base: 140, multiplier: 1.08, baseCost: 30 },
    },
  },

  // Mermi hızları
  PROJECTILES: {
    arrow:      { speed: 350, size: 3 },
    mageBolt:   { speed: 280, size: 4 },
  },

  // ─────────────────────────────────────────────────────────────
  // ASSET MANIFEST — her texture anahtarının tek görsel kaynağı.
  // Şimdi: geometrik placeholder (shape/size/color). Oyun kodu yalnızca
  // anahtarı kullanır; ileride buraya `sprite` eklemek (örn.
  // { sprite: 'assets/skeleton.png', frames: { frameWidth, frameHeight } })
  // oynanışa dokunmadan görseli değiştirir.
  // ─────────────────────────────────────────────────────────────
  ASSETS: {
    // Enemies — Red Units + Black Units for bosses
    'enemy-ghoul':        { sprite: 'assets/units/red-pawn-idle.png',       frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-gargoyle':     { sprite: 'assets/units/red-warrior-idle.png',    frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-imp':          { sprite: 'assets/units/red-archer-idle.png',     frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-soulVessel':   { sprite: 'assets/units/red-pawn-meat.png',       frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-cursedKnight': { sprite: 'assets/units/red-lancer-idle.png',     frames: { frameWidth: 320, frameHeight: 320 } },
    'enemy-warden':       { sprite: 'assets/units/red-warrior-guard.png',   frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-ooze':         { sprite: 'assets/units/red-monk-idle.png',       frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-cultist':      { sprite: 'assets/units/yellow-monk-idle.png',    frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-boss_tank':      { sprite: 'assets/units/black-warrior-idle.png',  frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-boss_berserker': { sprite: 'assets/units/black-lancer-idle.png',   frames: { frameWidth: 320, frameHeight: 320 } },
    'enemy-boss_shaman':    { sprite: 'assets/units/black-monk-idle.png',     frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-boss_splitter':  { sprite: 'assets/units/purple-monk-idle.png',    frames: { frameWidth: 192, frameHeight: 192 } },
    'enemy-boss_armored':   { sprite: 'assets/units/black-pawn-idle.png',     frames: { frameWidth: 192, frameHeight: 192 } },
    // Defenders — Bina asset'leri (statik PNG, frames yok)
    'defender-necromancer': { sprite: 'assets/units/necromancer.png', frames: { frameWidth: 192, frameHeight: 192 } },
    'defender-archer':      { sprite: 'assets/units/skeleton-archer.png', frames: { frameWidth: 96, frameHeight: 96 } },
    'defender-golem':       { sprite: 'assets/units/stone-golem.png', frames: { frameWidth: 112, frameHeight: 112 } },
    'defender-mage':        { sprite: 'assets/buildings/blue-monastery.png' },
    'defender-bruiser':     { sprite: 'assets/units/skeleton-bruiser.png', frames: { frameWidth: 96, frameHeight: 96 } },
    'defender-cleric':      { sprite: 'assets/units/cleric.png', frames: { frameWidth: 96, frameHeight: 96 } },
    // Projectiles — keep geometric for now (tiny, fast-moving objects)
    'projectile-arrow':      { sprite: 'assets/units/arrow.png' },
    'projectile-mageBolt':   { shape: 'circle', size: 4, color: 0x88ccff },
  },

  // Düşman değerleri
  ENEMIES: {
    // Düşman kimliği Soul Debt evreni (K23): skeleton→ghoul, armored→gargoyle, fast→imp,
    // foodCarrier→soulVessel, elite→cursedKnight, shield→warden, splitter→ooze, healer→cultist.
    // NOT: 'shield'/'heal'/'split' STAT alanları (girdi içindeki) değişmez — yalnız anahtar+isim temalandı.
    ghoul:       { name: 'Ghoul',            hp: 10,  speed: 30, soul: 2,  meta: 0, metaType: 'bone', color: 0xcccccc },
    gargoyle:    { name: 'Gargoyle',         hp: 25,  speed: 20, soul: 5,  meta: 1, metaType: 'bone', color: 0x888888 },
    imp:         { name: 'Imp',              hp: 8,   speed: 50, soul: 3,  meta: 0, metaType: 'bone', color: 0xff6666 },
    soulVessel:  { name: 'Soul Vessel',      hp: 20,  speed: 30, soul: 2,  meta: 3, metaType: 'bone', color: 0x66ff66 },
    cursedKnight:{ name: 'Cursed Knight',    hp: 100, speed: 25, soul: 15, meta: 5, metaType: 'essence', color: 0xffaa00 },
    // Warden: orta HP ama kalkan ilk darbeleri emer (shield STAT'ı, HP eğrisinde ölçeklenir)
    warden:      { name: 'Warden',           hp: 30,  speed: 22, soul: 6,  meta: 1, metaType: 'essence', color: 0x6688cc, shield: 40 },
    // Ooze: savunucu ile ölünce 'split.count' küçük çocuğa bölünür (çocuklar bölünmez)
    ooze:        { name: 'Ooze',             hp: 24,  speed: 26, soul: 5,  meta: 0, metaType: 'essence', color: 0xcc66ff,
                   split: { count: 2, hpFactor: 0.4, rewardFactor: 0.35, scale: 0.6 } },
    // Cultist: her 'interval' sn'de menzildeki (kendisi hariç) düşmanları maxHP'nin fraction'ı kadar iyileştirir
    // (düşman healer — oyuncu 'cleric' birimiyle çakışmasın diye cultist, K23)
    cultist:     { name: 'Cultist',          hp: 28,  speed: 24, soul: 7,  meta: 1, metaType: 'essence', color: 0x33cc99,
                   heal: { fraction: 0.12, radius: 90, interval: 1.2 } },
    // ── Boss tipleri ── her bossEvery wave'de tek spawn; rotasyon WaveManager'da
    // boss_tank: zırhlı, çok yüksek HP + kalkan — yavaş ama dayanıklı
    boss_tank:    { name: 'Tank Boss',    hp: 1000, speed: 12, soul: 140, meta: 25, metaType: 'crystal', color: 0xcc3333,
                    shield: 300 },
    // boss_berserker: hızlı saldırıcı + rage — hasar aldıkça hızlanır (max 2× base speed)
    boss_berserker: { name: 'Berserker Boss', hp: 500, speed: 32, soul: 160, meta: 18, metaType: 'crystal', color: 0xff6600,
                      rage: { speedGainFraction: 0.04, maxMultiplier: 2.0 } },
    // boss_shaman: kendini iyileştiren — orta HP + heal özelliği, bitirmek zor
    boss_shaman:  { name: 'Shaman Boss',  hp: 700, speed: 16, soul: 150, meta: 22, metaType: 'crystal', color: 0xaa44ff,
                    heal: { fraction: 0.05, radius: 0, interval: 2.5 } }, // radius:0 → sadece kendini iyileştirir
    // boss_splitter: ölünce 3 mini boss'a bölünür — mini'ler bölünmez ve düşük ödül verir
    boss_splitter: { name: 'Splitter Boss', hp: 600, speed: 20, soul: 130, meta: 20, metaType: 'crystal', color: 0xff44cc,
                     split: { count: 3, hpFactor: 0.35, rewardFactor: 0.3, scale: 0.55 } },
    // boss_armored: yavaş ama güçlü kalkan + yüksek HP
    boss_armored: { name: 'Armored Boss',  hp: 1400, speed: 9,  soul: 180, meta: 30, metaType: 'crystal', color: 0x778899,
                    shield: 500 },
  },

  // Boss rotasyon sırası — bossEvery'nin katlarında bu sırayla döner
  BOSS_ROTATION: ['boss_tank', 'boss_berserker', 'boss_shaman', 'boss_splitter', 'boss_armored'],

  // Dalga sistemi
  WAVES: {
    baseEnemiesPerWave: 5,
    enemiesPerWaveGrowth: 0.3,
    timeBetweenSpawns: 1200,
    timeBetweenWaves: 2000,
    hpScaling: 1.08,
    soulScaling: 1.05,
    bossEvery: 10, // her 10 wave'de boss dalgası
    typeUnlocks: { ghoul: 1, gargoyle: 5, imp: 8, soulVessel: 3, cursedKnight: 15, warden: 10, ooze: 12, cultist: 14 },
  },

  // Prestige (K14/K15/K26 — Model Y derinlik çarpanı + iki yol)
  PRESTIGE: {
    wavesPerFloor: 10,       // 10 wave = 1 kat (K7)
    godFloor: 4,             // tanrı bu katta (DESIGN 7.1 placeholder; playtest'te artabilir — K26 "ör. Kat 10")
    // Model Y: kalıcı çarpan = base + ulaşılan_kat × perFloor  (derinliğe bağlı — K15)
    baseMultiplierGain: 0.3, // en sığ prestige bile bu kadar verir
    perFloorGain: 0.25,      // her ulaşılan kat ek çarpan
    forcedRatio: 0.5,        // zorlanmış (ölüm) prestige = gönüllünün yarısı (Diş-1, K14)
    godBossType: 'boss_armored', // tanrı için kullanılacak boss asset/stat (geçici; Faz G'de özel 'god')
    godHpMultiplier: 3,      // tanrı normal boss'tan bu kat güçlü (kat bekçisi değil, final)
  },

  // Ses sistemi — prosedürel (Web Audio) SFX reçeteleri.
  // Asset dosyası yok; her efekt runtime'da sentezlenir. İleride sample
  // tabanlıya geçerken bu reçeteler { sample: 'path' } ile değiştirilebilir.
  SOUND: {
    enabled: true,        // Varsayılan ses durumu (save ile override edilir)
    masterVolume: 0.5,    // 0..1 — tüm SFX'lere çarpan
    // engine: 'tone' (osilatör, opsiyonel frekans süpürmesi)
    //         'noise' (lowpass'tan geçen gürültü patlaması)
    //         'sequence' (arka arkaya notalar — fanfar/çoklu ton)
    sfx: {
      archerFire:    { engine: 'tone',  type: 'triangle', freq: 880, freqEnd: 480, duration: 0.07, gain: 0.12, throttleMs: 45 },
      deathDefender: { engine: 'tone',  type: 'square',   freq: 420, freqEnd: 180, duration: 0.09, gain: 0.16, throttleMs: 25 },
      upgrade:       { engine: 'tone',  type: 'sine',     freq: 660, freqEnd: 990, duration: 0.12, gain: 0.25 },
      hire:          { engine: 'sequence', type: 'sine', gain: 0.28, notes: [{ freq: 523, duration: 0.09 }, { freq: 784, duration: 0.12 }] },
      waveComplete:  { engine: 'sequence', type: 'triangle', gain: 0.26, notes: [{ freq: 523, duration: 0.10 }, { freq: 659, duration: 0.10 }, { freq: 784, duration: 0.14 }] },
      prestige:      { engine: 'sequence', type: 'sawtooth', gain: 0.30, notes: [{ freq: 392, duration: 0.12 }, { freq: 523, duration: 0.12 }, { freq: 659, duration: 0.12 }, { freq: 1047, duration: 0.22 }] },
      uiDenied:      { engine: 'tone',  type: 'square',   freq: 220, freqEnd: 160, duration: 0.10, gain: 0.14, throttleMs: 80 },
      mapOpen:       { engine: 'tone',  type: 'sine',     freq: 440, freqEnd: 660, duration: 0.10, gain: 0.18 },
      mageFire:      { engine: 'tone',  type: 'sine',     freq: 880, freqEnd: 1200, duration: 0.08, gain: 0.14, throttleMs: 50 },
    },
  },

  // Conquest Map — Skill Tree node'ları
  CONQUEST_NODES: {
    laserBoost1: {
      id: 'laserBoost1', name: 'Laser Boost I',
      description: '+25% Laser Damage',
      cost: { soul: 50 },
      effect: { type: 'defenderBoost', target: 'necromancer', stat: 'damage', value: 0.25 },
      requires: [], x: 100, y: 80,
    },
    laserBoost2: {
      id: 'laserBoost2', name: 'Laser Boost II',
      description: '+25% Laser Fire Rate',
      cost: { soul: 150 },
      effect: { type: 'defenderBoost', target: 'necromancer', stat: 'fireRate', value: 0.25 },
      requires: ['laserBoost1'], x: 280, y: 80,
    },
    defenderAura: {
      id: 'defenderAura', name: 'Defender Damage Aura',
      description: '+15% All Defender Damage',
      cost: { soul: 500 },
      effect: { type: 'globalBonus', stat: 'damage', value: 0.15 },
      requires: ['laserBoost2'], x: 480, y: 80,
    },
    soulGain: {
      id: 'soulGain', name: 'Soul Gain',
      description: '+20% Soul Gain',
      cost: { soul: 100 },
      effect: { type: 'economy', stat: 'soulMultiplier', value: 0.2 },
      requires: ['laserBoost1'], x: 100, y: 200,
    },
    archerMastery: {
      id: 'archerMastery', name: 'Archer Mastery',
      description: '+30% Archer Damage',
      cost: { soul: 300 },
      effect: { type: 'defenderBoost', target: 'archer', stat: 'damage', value: 0.3 },
      requires: ['defenderAura'], x: 480, y: 200,
    },
    metaGain: {
      id: 'metaGain', name: 'Meta Boost',
      description: '+30% Meta Gain',
      cost: { soul: 200 },
      effect: { type: 'economy', stat: 'metaMultiplier', value: 0.3 },
      requires: ['soulGain'], x: 100, y: 320,
    },
    cannonUnlock: {
      id: 'cannonUnlock', name: 'Cannon Unlock',
      description: 'Unlocks Cannon defender',
      cost: { soul: 400 },
      effect: { type: 'unlock', target: 'golem' },
      requires: ['archerMastery'], x: 480, y: 320,
    },
    cannonPower1: {
      id: 'cannonPower1', name: 'Cannon Power I',
      description: '+30% Cannon Damage',
      cost: { soul: 600 },
      effect: { type: 'defenderBoost', target: 'golem', stat: 'damage', value: 0.3 },
      requires: ['cannonUnlock'], x: 660, y: 320,
    },
    // NOT: prestigeUnlock node KALDIRILDI (K26/Faz G temizlik) — prestige artık tanrıyı yenince
    // (gönüllü) veya necromancer ölünce (zorlanmış) OTOMATİK tetiklenir; manuel açılış node'u ölüydü.

    // --- Tier 2 genişleme (yeni node'lar) ---

    archerSplash: {
      id: 'archerSplash', name: 'Archer Mastery',
      description: 'Her 5. ok menzildeki düşmanlara %40 alan hasarı verir',
      cost: { soul: 450 },
      effect: { type: 'archerSplash', splashEvery: 5, splashRadius: 55, splashFraction: 0.4 },
      requires: ['archerMastery'], x: 480, y: 440,
    },
    laserChain: {
      id: 'laserChain', name: 'Laser Enhancement II',
      description: 'Laser her vuruşta ikinci bir hedefe %50 hasar iletir',
      cost: { soul: 350 },
      effect: { type: 'laserChain', chainFraction: 0.5 },
      requires: ['laserBoost2'], x: 280, y: 200,
    },
    bossPenetration: {
      id: 'bossPenetration', name: 'Artillery Specialist',
      description: '+50% Boss hasarı — tüm savunucular',
      cost: { soul: 800 },
      effect: { type: 'bossBonus', value: 0.5 },
      requires: ['cannonPower1'], x: 660, y: 440,
    },
    metaGain2: {
      id: 'metaGain2', name: 'Meta Production II',
      description: '+30% Meta Kazanımı',
      cost: { soul: 300 },
      effect: { type: 'economy', stat: 'metaMultiplier', value: 0.3 },
      requires: ['metaGain'], x: 100, y: 560,
    },
    kingsDecree1: {
      id: 'kingsDecree1', name: "King's Decree I",
      description: '+40% tüm Soul ve Meta kazanımı',
      cost: { soul: 1500 },
      effect: { type: 'incomeMultiplier', value: 0.4 },
      requires: ['metaGain2'], x: 100, y: 680,
    },
    kingsDecree2: {
      id: 'kingsDecree2', name: "King's Decree II",
      description: '+60% tüm Soul ve Meta kazanımı',
      cost: { soul: 3000 },
      effect: { type: 'incomeMultiplier', value: 0.6 },
      requires: ['kingsDecree1'], x: 280, y: 680,
    },
    frostUnlock: {
      id: 'frostUnlock', name: 'Frost Tower Unlock',
      description: 'Frost Tower açılır — düşmanları yavaşlatır',
      cost: { soul: 700 },
      effect: { type: 'unlock', target: 'mage' },
      requires: ['defenderAura'], x: 480, y: 560,
    },
    catapultUnlock: {
      id: 'catapultUnlock', name: 'Catapult Unlock',
      description: 'Catapult açılır — uzun menzilli büyük AoE',
      cost: { soul: 1200 },
      effect: { type: 'unlock', target: 'bruiser' },
      requires: ['frostUnlock', 'bossPenetration'], x: 660, y: 560,
    },
    clericUnlock: {
      id: 'clericUnlock', name: 'Cleric Unlock',
      description: 'Cleric açılır — menzildeki dost birimleri iyileştirir',
      cost: { soul: 1500 },
      effect: { type: 'unlock', target: 'cleric' },
      requires: ['frostUnlock'], x: 660, y: 680, // frostUnlock ile çakışmasın (eskiden x480 y560)
    },
  },
};
