# Soul Debt — Yeni Agent Handoff Prompt

Aşağıdaki prompt'u yeni bir claude.ai Project'indeki ilk Claude oturumuna yapıştırarak projeye başlayabilirsin.
Bu prompt'la birlikte bu `docs/` klasöründeki dosyaları (DESIGN, DECISIONS, MIGRATION, ROADMAP) o Project'e yüklemelisin.

---

## PROMPT

```
"Soul Debt" adlı bir web oyunu geliştiriyoruz. Bu, Zero Stress King: Idle Defense
klonundan pivot edilmiş ÖZGÜN bir oyundur — klon değil. Phaser 3 + Vite +
JavaScript (ES6+) ile geliştirilir. Repo: anilrsln/soul-debt.

## Oyun Nedir (tek paragraf)
Ölü diriltmekten bıkmış, isteksiz bir necromancer, yeraltının soul ile beslenen
tanrısını devirmek için her kat aşağı iner, yolundaki her yaratıktan ruh (soul)
hasat eder, ordusunu bu ruhlarla kurar ve dibe doğru ilerler. Tür: AKTİF descent
tower defense (idle DEĞİL, ama idle'dan oto-savaş/üstel büyüme/kalıcı ilerleme
miras alır). Ton: kuru, bıkkın, kozmik-saçma mizah.

## Önce Bunları Oku
Repo'nun docs/ klasöründeki dosyalar tüm tasarımı içerir — başka yere bakmadan önce oku:
- docs/SOUL-DEBT-DESIGN.md  → oyunun NE olduğu + her kararın NEDEN'i
- docs/DECISIONS.md         → alınan VE reddedilen kararlar (aynı tartışmayı açma)
- docs/MIGRATION.md         → mevcut klon kodundan Soul Debt'e geçiş planı (dosya düzeyinde)

## Çekirdek Tasarım (özet — detay DESIGN'da)
- Ekonomi: SOUL (evrensel kaynak, eski EXP; düşman değeri + birim gücü + tüm
  harcamalar) + 3 meta: Bone/Essence/Crystal (birim TİPİ açar). Birim ÖRMEK soul
  ister — örme = soul + o birimin meta'sı (Model 3); tip açma node'dan.
  Level gate YOK; node'lar yalnız soul + prerequisite.
- Ritim: 10 wave = 1 kat. Kat sonu: necromancer canı full + kat-arası kurulum fazı
  (dizilim değiştir, birim ekle/absorbe). En dip = tanrı = gönüllü prestige.
- Savaş: DUR-DÖVÜŞ (düşman birime varınca durur, karşılıklı HP) → ön/arka saf.
  Oyuncu dizer; dizilim kat aralarında değişir, savaş içinde sabit.
- Birim ölümü: necromancer OTOMATİK diriltir (oyun başa dönmez, yerinde kalkar).
  Bedeli üç ceza: anlık soul + cooldown + biriken SOUL-DEBT (oyunun adı bu).
- Soul evrensel (4b): güçlü düşman çok soul düşürür; güçlü birim = yüksek
  soul-kapasite = pahalı diriliş = çok borç. Otomatik risk/ödül dengesi.
- Hat ihlali: düşman birimleri aşarsa NECROMANCER'A ulaşır (can havuzu) + borç.
  Can biterse koşu biter. Lava mekaniği TAMAMEN kaldırıldı.
- Prestige: gönüllü (tanrıyı yen) = tam çarpan; zorlanmış (necromancer öl) = yarı
  çarpan (Diş 1). Çarpan derinliğe bağlı (Model Y). Her prestige tam sıfırlama;
  kalıcı kalan: çarpan + açılmış birim tipleri.
- Absorbe: kat arası birim geri emme, kısmi meta iadesi (%50-70), isteğe bağlı.

## Kadro Hedefi
- 8 birim (yeniden tasarlanacak, en az 1-2 tank/blokçu — dur-dövüş gereği).
- ~10-12 düşman arketipi + kat-temalı görsel/stat varyantları (lineer tip ekleme
  değil, kombinasyonla çeşitlilik).
- 5 boss rotasyonu, katlara göre varyantlanır. Boss'lar Crystal'ın tek kaynağı.

## Temel Kurallar
1. JavaScript ES6+, TypeScript yok (şimdilik).
2. Phaser 3.80+ API, Vite bundler.
3. Tüm balans/sabitler config.js'de — magic number yazma.
4. Manager'lar tek sorumluluk, sahne'ler arası iletişim event ile.
5. Placeholder grafikler geometrik şekillerle (pixel art park'ta).
6. Görünür metin i18n'den; TR + EN paritesi şart. config.js name/desc mantıksal
   anahtar, UI'da id'den çevrilir.
7. Object pooling: yeni instance alanı eklersen reset()'e de ekle.
8. Git: commit sen atabilirsin, PUSH kullanıcıya bırak (SSH). Cloud/bridge
   oturumundan push/tarayıcı-testi yapılamaz; runtime doğrulama kullanıcıya bırakılır.

## Kullanıcı Bilgisi
- Ad: Anıl. Dil: Türkçe konuş.
- Full-stack + DevOps deneyimli, oyun geliştirmede yeni (web/PC ilk kez). Dürüst
  mühendislik değerlendirmesi ister (risk/fayda, erken optimizasyon uyarısı);
  gereksiz işi ve yarım bırakılmış kararları sevmez. Açık uç çoğaltmak yerine
  karar kapatmayı tercih eder.

## Mevcut Durum (2026-10-31 — Faz A-G TAMAM, Faz I (kontrol/deploy) TAMAM, Faz H kaldı)
Oyunun tam döngüsü çalışıyor + GitHub Pages'te yayında. Detaylı durum ROADMAP.md'de; özet:

**TAMAMLANAN (Faz A-F):** lava sök, ekonomi (soul+3meta), necromancer+can havuzu,
soul-debt+oto-diriltme, dur-dövüş, prestige (iki yol+Model Y).

**TAMAMLANAN (Faz G — kadro/sistem/ritim):**
- **Veri-odaklı mimari:** tek `Defender` sınıfı + GameScene registry (defenderKeys döngüsü).
  Yeni karakter = config.DEFENDERS'a obje. necromancer registry DIŞI (kendi entity'si, Necromancer.js).
- **Kadro (7 oyuncu birimi):** necromancer (ranged, can havuzu, başlangıç birimi), archer (ranged),
  golem (melee tank), bruiser (melee ön-saf, hızlı), mage (ranged saf-hasar), cleric (support/heal),
  **bluemage/Frost Mage (ranged kontrol — yavaşlat+frost-stack dondur).** combatType melee/ranged/support.
- **Düşman kimliği (K23):** ghoul/gargoyle/imp/soulVessel/cursedKnight/warden/ooze/cultist + 5 boss.
- **Veteran sistemi (K37):** VeteranManager — soul-bazlı kıdem, eşit dağıtım; diriltme KORUR, iptal SIFIRLAR.
- **Kat-arası tam-duraklama (K28):** kat sonu "İN" + geçiş kartı. SaveManager v9. Achievements güncel.
- **Çok-durumlu animasyon:** AssetProvider states{idle,walk,attack,hurt,death}; config-driven, geriye-uyumlu.
- **7 karakter sprite'ı bağlandı (placeholder):** necromancer/archer/bruiser/golem/cleric/mage/bluemage.

**TAMAMLANAN (Faz I — kontrol & deploy & conquest, bu oturum 2026-10-28/31):**
- **Kontrol sistemi (K38):** sol-tık seç / boş-alana-sol-tık bırak; sağ-tık komut (yürü/saldır/
  iyileştir). TÜM birimler hareket eder (necromancer dahil). Komut hedefi ölene/yeni komuta kadar
  sadık; menzilli birim kaçanı kovalar + hareket halinde ateş; melee savaş sonrası yerinde kalır.
- **Cleric hedefli heal (K38):** dost birime sağ-tık → full can olana kadar kilitli iyileştirme.
- **Deploy fazı (K39):** her floor başı sıfırdan dizilim. Ekip bara toplanır (KIDEM KORUMALI park
  sistemi — destroy YOK), kartla diz (sol-tık seç kart → sağ-tık saha), "BAŞLA". Necromancer karttan
  ZORUNLU (otomatik/default necromancer YOK). Savaşta craft edilen de yerleştirilebilir (deployedCount).
- **Necromancer mermi (K40):** beam KALDIRILDI → tek-tek mor ruh mermisi (soulBolt). Flick düzeldi.
  (laserChain/beam özel yetenekleri uykuda, ölü kod olarak duruyor.)
- **Conquest-gate (K41):** tüm kadro (necromancer hariç) conquest'ten açılır; panel + map SENKRON
  unlock (tek node satın alır, çift ödeme yok). archer da conquest'e bağlı (archerUnlock → archerMastery).

**Kararlar: K1-K41, reddedilenler R1-R14 (DECISIONS.md). SaveManager v9.**

## SIRADAKİ İŞ — kalan parçalar → Faz H cila/MVP
Öncelik (Anıl'la netleştir):
1. **Sürükle-bırak dizme (Deploy Parça 4):** kartı tutup sahaya sürükleme. Şu an seç-sağtık
   çalışıyor; bu tek kalan deploy parçası. GameScene _rebuildDeployBar kartlarına Phaser drag ekle,
   drop'ta _deploySlotAt(slot, worldX, worldY). (İsteğe bağlı — seç-sağtık zaten tam işlevsel.)
2. **8 düşman sprite'ı** — asset Anıl'dan gelir, ASSET-BRIEF §9 PIL yöntemiyle bağlanır. Anahtar
   `enemy-<key>`. + spell efekt sprite'ları (soul bolt impact, freeze ring).
3. **Lore** (boss banner, bestiary, idle necromancer replikleri) — i18n TR+EN.
4. **Faz H — denge playtest (Anıl oynar):** veteran kıdem hızı, cleric heal, borç eğrisi, kat zorluğu,
   essence/meta akışı (golem/cleric/bluemage essence ister — erken floor'da kıt olabilir), bluemage
   frost-stack eşiği, necromancer mermi dengesi. HEPSİ config'de placeholder. **MVP bitiş çizgisi.**

**Açık denge kalemi (Anıl'ın dikkatine):** essence ekonomisi — golem/cleric/bluemage craft'ı essence
ister ama essence'ı sadece ileri düşmanlar (cursedKnight/warden/ooze/cultist) az miktar düşürür. Erken
floor'da bu birimler craft edilemeyebilir. Çözüm playtest'te: essence drop'u artır VEYA craft maliyetini
düşür (DECISIONS'ta açık bırakıldı). Dev panelde +100 essence/crystal butonları test için var.

**Park (şimdilik DEĞİL):** harita engel-çarpışması + A*, absorbe cilası, yeni düşman arketipleri,
endless/NG+, ses/müzik, necromancer özel yetenekleri (laserChain mermiye uyarlama). (ROADMAP park.)

## Çalışma Biçimi (ÖNEMLİ — Anıl'ın tercihleri)
- **GIT:** commit'i SEN atarsın (src/docs), ama PUSH Anıl'da (bu repo için Claude GitHub App
  kurulu DEĞİL, cloud oturumdan push 403). Commit'leri Anıl'a `git bundle` ile ver:
  `git bundle create <AD>.bundle <onun-head'i>..HEAD` → SendUserFile. HER bundle'a FARKLI isim
  ver (aynı isim Desktop'ta eski dosyayla karışır — bu bir kez 14 commit kaybına yol açtı).
- **Her mantıksal adımda:** `node --check` tüm src + `npx vite build` + programatik mantık testi
  (saf fonksiyonları izole çalıştır). Sonra commit. Anıl runtime'ı kendi test eder (cloud'dan
  tarayıcı yok).
- **Kapsamı önce netleştir:** Anıl açık uç/yarım karar sevmez; kod yazmadan önce kararı kapat.
  Dürüst risk/fayda değerlendirmesi ister (erken optimizasyon uyarısı dahil).
- Sprite işleme script'leri scratchpad'de (kalıcı değil); görseli analiz et, kendi script'ini yaz.
```

---

## Yeni claude.ai Project'ine Yüklenecek Dosyalar
Repo zaten docs/ altında taşıyor, ama Project'e ayrıca yüklemek istersen:
- `docs/SOUL-DEBT-DESIGN.md`
- `docs/DECISIONS.md`
- `docs/MIGRATION.md`
- `docs/ROADMAP.md`
- (bu dosya — referans olarak)
