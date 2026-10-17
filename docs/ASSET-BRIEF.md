# Soul Debt — Görsel Varlık Brief'i (Asset Brief)

> Bu doküman, görsel üretim araçlarına (Gemini, vb.) **doğrudan verilmek** için yazılmıştır.
> Amaç: oyunun tüm görsel varlıklarını (birimler, düşmanlar, boss'lar, zemin, UI) **tek bir
> tutarlı sanat yönünde** üretmek. Tasarım gerekçeleri `SOUL-DEBT-DESIGN.md` ve `DECISIONS.md`'de;
> burada yalnızca görsel üretim için gereken öz + kesin varlık listesi var.
>
> **Üretim sırası önerisi:** Önce TEK bir örnek varlık üret (ör. Necromancer veya İskelet Bruiser),
> beğendiğin stili SABİTLE, sonra kalan tüm varlıkları "aynı stil/palet/çözünürlük referansına göre"
> iste — aksi halde her varlık farklı stilde çıkar ve set tutarsız olur. Pratik adımlar §8'de.

---

## 1. Oyun Nedir? (Tek Paragraf)

**Soul Debt**, isteksiz ve bıkkın bir **necromancer**'ın yeraltının ruh-obur tanrısını devirmek
için kat kat aşağı indiği bir **aktif descent tower-defense** oyunudur. Necromancer yolundaki
yeraltı yaratıklarını öldürür, onlardan topladığı **ruhla (soul)** kendi iskelet ordusunu kurar
ve dibe doğru ilerler. Ton: **kuru, bıkkın, kozmik-saçma mizah** — epik değil, yorgun ve alaycı.

## 2. Temel Oyun Akışı (Sanatçının Bilmesi Gerekenler)

Görsellerin nasıl bir sahnede yan yana duracağını anlamak için akış:

1. **Sahne:** Yatay bir savaş alanı (yıkıntı bir yeraltı dungeon'u). Düşmanlar **sağdan** gelir,
   **sola** doğru necromancer'a yürür. Oyuncunun iskelet ordusu arada dizilidir.
2. **Dalga/Kat ritmi:** 10 dalga = 1 kat. Her kat daha derin, daha karanlık, daha tehditkâr.
   Her 10. dalgada bir **boss (kat bekçisi)** gelir. En dipte **tanrı** vardır (nihai hedef).
3. **Savaş:** Dur-dövüş — düşman bir iskelet birime çarpınca durur ve karşılıklı döğüşürler
   (yan yana, iki küçük figür birbirine vuruyor). Necromancer arkadan menzilli saldırır.
4. **Necromancer = son hat:** Düşman iskelet ordusunu aşarsa necromancer'a ulaşır ve canından
   keser. Necromancer'ın canı biterse koşu biter.
5. **Ordu kurma:** Oyuncu topladığı ruhla yeni iskelet birimler "örer" ve sahaya dizer.

**Sanat açısından kritik sahne okuması:** Ekranda aynı anda ~5-15 küçük figür hareket eder.
Her figürün **siluetten** (uzaktan, küçükken) anında tanınması şarttır. Detay değil, **siluet +
renk kodu** okunabilirliği taşır.

## 3. Neden 2D Pixel Art? (Sanat Yönü Motivasyonu)

Bu oyun **2D pixel art** olacak. Nedenleri (üretimi buna göre yönlendir):

- **Okunabilirlik:** Küçük, kalabalık, hızlı hareket eden figürlerde pixel art net siluet ve
  net renk-kodu verir. Gerçekçi/detaylı render küçük boyutta bulanıklaşır ve "bu birim mi düşman mı?"
  karışıklığı yaratır.
- **Tematik uyum:** Kuru-karanlık mizah + yeraltı teması, retro/pixel estetiğin hafif grotesk,
  abartılı siluetleriyle çok iyi örtüşür. Epik-foto-gerçekçi değil; "tuhaf, bıkkın, yeraltı" hissi.
- **Üretim ve tutarlılık:** Sınırlı palet + sınırlı çözünürlük, çok sayıda varlığı tutarlı bir
  sette tutmayı kolaylaştırır (büyük prodüksiyon bütçesi gerektirmez; tek kişilik/küçük ekip dostu).
- **Teknik:** Oyun Phaser 3 + web canvas'ta çalışır; sprite-sheet tabanlı animasyon pixel art ile
  doğal ve performanslıdır. Şu an oyunda **geometrik placeholder**'lar var; pixel art onların yerini
  alacak (oyun kodu yalnızca asset anahtarını kullanır — oynanışa dokunmadan görsel değişir).

**İstenen pixel art alt-stili:** Orta çözünürlük, net dış hat (okunur siluet), sınırlı ama
doygun palet, hafif grotesk/karikatürize oranlar (büyük kafa/silah, abartılı siluet). Fazla
ince detaydan kaçın — uzaktan okunurluk > yakın detay.

## 4. İKİ TARAF, ASLA KARIŞMAZ (En Önemli Kural)

Oyunun en kritik görsel kuralı (DECISIONS K23):

- **OYUNCU ORDUSU = İSKELETLER / DİRİLMİŞLER.** Kemik beyazı/gri, necromancer'ın diriltiği ölüler.
  Soğuk tonlar (kemik beyazı, buz mavisi vurgular, soluk mor necromancer enerjisi).
- **DÜŞMANLAR = YERALTI YARATIKLARI.** Etli/çürük, taş, ruhsal, lanetli varlıklar. ASLA iskelet
  görünmez. Sıcak/hastalıklı tonlar (çürük yeşil, kan kırmızısı, taş grisi, lanetli mor).

İki taraf bir ekranda yan yana olduğunda bir bakışta ayrılmalı. İskelet bir düşman ÇİZME;
etli/çürük bir oyuncu birimi ÇİZME. Bu ayrım hem hikâye (necromancer düşmanı öldürüp orduya katar)
hem okunabilirlik için zorunludur.

## 5. Palet (Oyun Kodundaki Mevcut Renkler)

Oyunun arka plan/UI paleti (bu tonlarla uyumlu üret):

- Gökyüzü/zemin: koyu lacivert-mor `#1a1a2e` / `#15152a`, zemin `#111120`
- Necromancer ışını / buz vurgusu: cyan `#00ffff`
- Soul (ruh) enerjisi: soluk mor `#c9b3ff`
- Meta kaynakları: Bone 🦴 kemik grisi `#d8d8d8` · Essence 🔮 mor `#b060ff` · Crystal 💎 cyan `#55e0e0`
- UI accent: `#e94560` (kırmızı), altın `#ffd700`

**Oyuncu birimleri** soğuk-kemik paletinde; **düşmanlar** sıcak-hastalıklı paletinde kalsın.

## 6. Teknik Spesifikasyon (ZORUNLU)

Üretilen dosyalar doğrudan oyuna düşecek. Şu kurallara uy:

- **Format:** PNG, **şeffaf arka plan** (alpha). Arka plan dolgusu YOK.
- **Perspektif:** Yandan (side-view) veya hafif 3/4 — tüm varlıklarda AYNI açı. Karışık açı olmaz.
- **Yön:** Oyuncu birimleri **sağa** bakar (düşmana doğru); düşmanlar **sola** bakar (necromancer'a).
  Tek yön üret; kod gerekirse çevirir. (Üretimde tutarlı tek yön ver.)
- **Zemin çizgisi:** Figürler "ayakta duruyor" gibi; taban ortada-altta, boşlukta yüzmesin.
- **Boyut (frame):** Normal birimler/düşmanlar **192×192 px** kare. Büyük/elit figürler (ör. elit
  düşman, bazı boss'lar) **320×320 px**. Tek figür frame'i ortalanmış olsun.
- **Animasyon (idle):** Mümkünse yatay **sprite sheet** (eşit frame'ler, ör. 4-6 kare idle döngüsü,
  her kare 192×192). Tek statik kare de kabul (animasyon sonra eklenir). Sheet verirsen frame
  sayısı + frame boyutunu belirt.
- **Siluet testi:** Her varlık, tek renk siluete indirgendiğinde bile tanınmalı.

## 7. Üretilecek Varlıklar (Tam Liste)

### 7.1 Necromancer (oyuncu — sabit başlangıç birimi)
Bıkkın, yorgun bir büyücü; necromancer. Sabit durur, arkadan menzilli saldırır. Kaybedersen ölen o.
Kuru-mizah tonu: epik kötü büyücü değil, "yine mi bu iş" diyen yorgun bir figür. Soğuk-mor/cyan enerji.
- `defender-necromancer` — 192×192 (idle). *(Not: mevcut kod geçici olarak `defender-laser` asset
  anahtarını kullanıyor; dosyayı `defender-necromancer` üret, kod anahtarı Faz G'de güncellenecek —
  ya da şimdilik `blue-tower.png` yerine koyulacak; dosya adını ekip belirler.)*

### 7.2 Oyuncu Birimleri — İSKELET ORDUSU (5 MVP birimi)
Hepsi kemik/dirilmiş estetiği; soğuk palet. Rolleri siluetten okunmalı.

| Asset anahtarı | Birim | Görsel yön |
|---|---|---|
| `defender-skeleton-bruiser` | İskelet Bruiser | Ön-saf dövüşçü iskelet; orta-iri, kaba silah (balta/topuz), omuzları geniş |
| `defender-skeleton-archer` | İskelet Okçu | İnce iskelet, yay; küçük/çevik siluet |
| `defender-mage-damage` | Hasar Büyücüsü | İskelet/kukuletalı büyücü, alan-hasarı enerjisi (mor/cyan), asa |
| `defender-mage-healer` | Healer Büyücü | İskelet/kukuletalı destek büyücü; yeşilimsi-beyaz şifa enerjisi (ama iskelet kalır) |
| `defender-golem` | Taş Golem | EN iri, tank; taştan+kemikten devasa siluet, ağır. 320×320 olabilir |

### 7.3 Düşmanlar — YERALTI YARATIKLARI (8 arketip)
Hepsi etli/çürük/taş/ruhsal/lanetli; sıcak-hastalıklı palet. ASLA iskelet değil.

| Asset anahtarı | Düşman | Görsel yön |
|---|---|---|
| `enemy-ghoul` | Gulyabani | Zayıf çürük et yaratığı, taban düşman, küçük |
| `enemy-gargoyle` | Taş Gargoyle | Taştan kanatlı yaratık, iri, yavaş, yüksek HP hissi |
| `enemy-imp` | İmp | Küçük hızlı şeytani yaratık, çevik siluet |
| `enemy-soulVessel` | Ruh Kesesi | İçinde ruh taşıyan şişkin yaratık; ölünce ruh saçar (parlayan göbek) |
| `enemy-cursedKnight` | Lanetli Şövalye | İri lanetli zırhlı (ama et/lanet, iskelet değil); elit, tehditkâr. 320×320 |
| `enemy-warden` | Kalkanlı Muhafız | Büyük kalkan taşıyan yaratık; kalkan siluetten belli |
| `enemy-ooze` | Jöle | Yarı-saydam çürük jöle; ölünce bölünür (yuvarlak/akışkan siluet) |
| `enemy-cultist` | Kültist | Kukuletalı lanetli figür; destek/şifa yayar (yeşil aura) — tek menzilli |

### 7.4 Boss'lar — KAT BEKÇİLERİ (5 rotasyon)
Düşman tarafının devasa, tehditkâr versiyonları. Her biri bir arketipin "kat bekçisi" ölçeğinde
büyütülmüş hali. 320×320 (veya daha büyük). İsimler şu an jenerik (lore isimleri Faz G'de gelir):

| Asset anahtarı | Boss | Karakter |
|---|---|---|
| `enemy-boss_tank` | Tank Boss | Devasa zırhlı+kalkanlı; çok yüksek HP, yavaş |
| `enemy-boss_berserker` | Berserker Boss | Hızlı saldırgan; hasar aldıkça kızarır/öfkelenir |
| `enemy-boss_shaman` | Shaman Boss | Kendini iyileştiren ruhsal/lanetli büyücü yaratık |
| `enemy-boss_splitter` | Splitter Boss | Ölünce mini-boss'lara bölünür; akışkan/çoğalan siluet |
| `enemy-boss_armored` | Armored Boss | En yavaş, en kalın zırh; taş-dev |

### 7.5 Mermiler / Efektler (küçük — şimdilik geometrik kalabilir)
İstersen üret, yoksa geometrik placeholder yeterli (küçük, hızlı hareket eden nesneler):
- `projectile-arrow` (ok), `projectile-cannonball`, `projectile-frostbolt` (buz), `projectile-boulder`
- Soul toplama parçacığı (mor ışıltı), ölüm patlaması

### 7.6 Zemin / Arka Plan (MVP: tek yıkıntı-dungeon)
Yatay savaş alanı zemini: **yıkıntı bir yeraltı dungeon'u**. İçinde kayalar/taşlar (engel),
bir köprü, bir meydan, bir dar boğaz. Koyu lacivert-mor atmosfer (`#1a1a2e`). Katlar derinleştikçe
renk varyantı (daha kızıl/daha karanlık) üretilebilir — ama MVP tek zemin.
- Tiling zemin dokusu veya tek büyük arka plan (800×500 oyun alanı; ölçeklenebilir).

## 8. Gemini'ye Verirken İpuçları

- **Önce 1 varlık, stili sabitle:** "Necromancer'ı üret" → beğen → "aynı stil/palet/çözünürlükle
  şimdi İskelet Bruiser" diye devam et. Her istekte önceki görseli referans ekle.
- **Tutarlılık cümlesi:** Her prompt'a ekle: *"2D pixel art, şeffaf arka plan, yandan görünüm,
  [aynı palet], okunur siluet, 192×192 (veya 320×320), tek figür ortalanmış."*
- **İki-taraf kuralını tekrarla:** oyuncu birimleri için "iskelet, kemik beyazı, soğuk ton";
  düşmanlar için "etli/çürük/taş yeraltı yaratığı, iskelet DEĞİL, sıcak-hastalıklı ton".
- **Sprite sheet:** Gemini düzgün sheet üretemezse tek idle karesi iste; animasyonu ekip sonra ekler.
- Üretilen dosyaları `public/assets/units/` ve `public/assets/buildings/` altına, yukarıdaki
  asset anahtarlarıyla eşleşen adlarla koy (config `ASSETS` manifesti anahtarları buraya işaret eder).

---

## 9. Not: Kod Tarafı Durumu
Oyunun mevcut asset manifesti `src/config.js` içindeki `ASSETS` bloğundadır; şu an bazı anahtarlar
eski klon placeholder'larına (`red-pawn-idle.png` vb.) işaret eder. Pixel art hazır olunca manifest
yeni dosya adlarıyla güncellenir — bu kod işi (Faz G / asset entegrasyonu), görsel üretimi bekler.
Boyutlar (192/320) mevcut manifestteki `frameWidth/frameHeight` değerleriyle uyumludur.
