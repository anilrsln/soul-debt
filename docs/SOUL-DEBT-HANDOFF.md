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

## Bu Oturumda Ne Yapacağız?
docs/ altındaki tasarım dosyalarını oku. Sonra Anıl'a hangi fazdan başlamak
istediğini sor (MIGRATION.md'deki Faz A-H sırası önerilir: önce lava temizliği,
sonra ekonomi, sonra necromancer/savaş). Repo durumunu kontrol et (git status).
Kod yazmadan önce o fazın kapsamını netleştir.
```

---

## Yeni claude.ai Project'ine Yüklenecek Dosyalar
Repo zaten docs/ altında taşıyor, ama Project'e ayrıca yüklemek istersen:
- `docs/SOUL-DEBT-DESIGN.md`
- `docs/DECISIONS.md`
- `docs/MIGRATION.md`
- `docs/ROADMAP.md`
- (bu dosya — referans olarak)
