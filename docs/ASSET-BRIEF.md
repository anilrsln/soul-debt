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
- **Boyut (frame):** Önerilen **96×96 px** kare (normal birim/düşman). Büyük/elit figürler (Lanetli
  Şövalye, boss'lar) **128×128** veya **192×192**. — Neden 96: oyunda birimler ~30-60 px görünür;
  96 keskinlik/dosya dengesi için ideal. Üretim aracı 96'da bulanık üretirse 192'ye çık (kod her
  boyutu config'den okur; kesin boyut bir test sprite'ıyla belirlenir). Boyut KODU etkilemez —
  sadece `config.js` ASSETS `frames.frameWidth/frameHeight` değeridir.
- **Animasyon — çok durumlu (yeni, kod HAZIR):** Her karakter için şu durumlar, **tek yatay sprite
  sheet'te ARDIŞIK frame blokları** olarak (idle önce, sonra walk, sonra attack...):
  | Durum | Önerilen frame | Loop | Ne zaman oynar |
  |---|---|---|---|
  | **idle** | 4-6 | evet | hareketsiz beklerken |
  | **walk** | 6-8 | evet | yürürken (düşman) / lunge+dönüş (melee birim) |
  | **attack** | 4-6 | hayır (tek sefer) | atış/vuruş anında, sonra idle'a döner |
  | **hurt** | 2-3 | hayır | hasar alınca kısa sarsılma (opsiyonel) |
  | **death** | 5-8 | hayır | ölünce, sonra sönerek kaybolur |
  Frame sayıları **esnek** — ne üretirsen config'e o start/count yazılır. **Minimum: idle.** walk/
  attack/hurt/death opsiyonel; eksik olanı kod otomatik idle'a düşürür (kırılmaz). Her state'in frame
  **başlangıç indeksi + sayısı + hızı + loop'u** üretimde belirtilmeli (örn. "idle 0-3, walk 4-11,
  attack 12-16, death 17-23").
- **Siluet testi:** Her varlık, tek renk siluete indirgendiğinde bile tanınmalı.

## 7. Üretilecek Varlıklar (Tam Liste)

### 7.1 Necromancer (oyuncu — sabit başlangıç birimi)
Bıkkın, yorgun bir büyücü; necromancer. Sabit durur, arkadan menzilli saldırır. Kaybedersen ölen o.
Kuru-mizah tonu: epik kötü büyücü değil, "yine mi bu iş" diyen yorgun bir figür. Soğuk-mor/cyan enerji.
- **Asset anahtarı: `defender-necromancer`** (kodda hazır). Animasyon durumları: idle (zorunlu),
  walk, attack (menzilli soul atışı — asa kaldırıp mavi ışın/soul fırlatma), hurt, death.
  ChatGPT'nin verdiği necromancer sheet'i bu anahtara uyar.

### 7.2 Oyuncu Birimleri — İSKELET ORDUSU (6 birim)
Hepsi kemik/dirilmiş estetiği; soğuk palet. Rolleri siluetten okunmalı.
**Asset anahtarları KODDAKİ gerçek anahtarlardır — dosya adı bunlarla eşleşmeli.**

| Asset anahtarı | Birim | combatType | Animasyon notu | Görsel yön |
|---|---|---|---|---|
| `defender-archer` | İskelet Okçu | ranged | attack = yay çekip ok atma | İnce iskelet, yay; küçük/çevik siluet |
| `defender-golem` | Taş Golem | melee | walk = ağır yürüyüş, attack = yumruk/çarpma | EN iri tank; taş+kemik devasa, ağır |
| `defender-bruiser` | İskelet Bruiser | melee | walk+attack hızlı (ön-saf vurucu) | Orta-iri dövüşçü iskelet, kaba silah (balta/topuz) |
| `defender-mage` | Hasar Büyücüsü | ranged | attack = asa kaldırıp mor/cyan AoE enerji | İskelet/kukuletalı büyücü, asa |
| `defender-cleric` | Şifacı Büyücü | support | attack = şifa yayma (yeşilimsi-beyaz pulse), savaşmaz | İskelet/kukuletalı destek büyücü, iskelet kalır |

*(Necromancer bunlardan ayrı — §7.1. Bu 5 + necromancer = 6 oyuncu birimi.)*

### 7.3 Düşmanlar — YERALTI YARATIKLARI (8 arketip)
Hepsi etli/çürük/taş/ruhsal/lanetli; sıcak-hastalıklı palet. ASLA iskelet değil.
**Animasyon durumları:** idle (zorunlu), **walk** (soldan necromancer'a yürür — en çok görünen),
attack (bir iskelet birime çarpınca dur-dövüş vuruşu), hurt, death. walk önceliklidir.
Asset anahtarları kodda hazır.

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

### 7.5 Mermiler / Efektler (sprite — cilalı efekt rotası, A seçeneği)
Oyunun kadrosu melee'ye kaydı, yalnız iki mermi kaldı:
- `projectile-arrow` (İskelet Okçu oku) · `projectile-mageBolt` (Hasar Büyücüsü soul boltu, mavi/cyan)
- **Spell efektleri (ChatGPT sheet'inde var, kullanılacak):** staff cast, soul orb, soul projectile,
  summon effect, soul absorb, summon circle. Bunlar sprite olarak bağlanacak (A seçeneği — cilalı).
  Efekt sprite bağlama kodu asset'ler gelince yazılır; şimdilik geometrik placeholder oynuyor.
- Her efekt: küçük yatay sheet (birkaç frame, tek sefer oynar), 64×64 veya 96×96.

### 7.6 Zemin / Arka Plan (MVP: tek yıkıntı-dungeon)
Yatay savaş alanı zemini: **yıkıntı bir yeraltı dungeon'u**. İçinde kayalar/taşlar (engel),
bir köprü, bir meydan, bir dar boğaz. Koyu lacivert-mor atmosfer (`#1a1a2e`). Katlar derinleştikçe
renk varyantı (daha kızıl/daha karanlık) üretilebilir — ama MVP tek zemin.
- Tiling zemin dokusu veya tek büyük arka plan (800×500 oyun alanı; ölçeklenebilir).

## 8. Gemini'ye Verirken İpuçları

- **Önce 1 varlık, stili sabitle:** "Necromancer'ı üret" → beğen → "aynı stil/palet/çözünürlükle
  şimdi İskelet Bruiser" diye devam et. Her istekte önceki görseli referans ekle.
- **Tutarlılık cümlesi:** Her prompt'a ekle: *"2D pixel art, şeffaf arka plan, yandan görünüm,
  [aynı palet], okunur siluet, 96×96 frame (boss 128-192), tek figür ortalanmış."*
- **İki-taraf kuralını tekrarla:** oyuncu birimleri için "iskelet, kemik beyazı, soğuk ton";
  düşmanlar için "etli/çürük/taş yeraltı yaratığı, iskelet DEĞİL, sıcak-hastalıklı ton".
- **Çok-durum sheet isterken:** "tek yatay sprite sheet, şu durumlar ardışık: idle (4-6), walk (6-8),
  attack (4-6, tek sefer), death (5-8). Her frame 96×96, eşit aralıklı." Üretince frame aralıklarını
  (idle 0-5, walk 6-13...) not et — config'e bu girilir. Minimum idle; gerisi eksikse kod idle'a düşer.
- **Boyut belirsizse:** önce 1 karakteri 96'da üret, oyunda test et; bulanıksa 192'ye çık.
- Üretilen dosyaları `public/assets/units/` ve `public/assets/buildings/` altına, yukarıdaki
  asset anahtarlarıyla eşleşen adlarla koy (config `ASSETS` manifesti anahtarları buraya işaret eder).

---

## 9. Not: Kod Tarafı Durumu
Oyunun mevcut asset manifesti `src/config.js` içindeki `ASSETS` bloğundadır; şu an bazı anahtarlar
eski klon placeholder'larına (`red-pawn-idle.png` vb.) işaret eder. Pixel art hazır olunca manifest
yeni dosya adlarıyla güncellenir — bu kod işi (asset entegrasyonu), görsel üretimi bekler.

**Çok-durumlu animasyon altyapısı HAZIR (Faz G):** `AssetProvider` artık key başına birden çok
durum (idle/walk/attack/hurt/death) destekler. Her durum tek sheet'te ardışık frame bloğudur;
`ANIM_DEFS[key].states = { idle:{start,count,frameRate,loop}, walk:{...}, ... }` ile tanımlanır.
Defender ve Enemy durum geçişlerini otomatik yapar (yürü→walk, vuruş→attack tek sefer, ölüm→death).
Sheet'te bir durum yoksa idle'a düşer (kırılmaz). Yani: sprite sheet'i üret → dosyayı koy → config
ASSETS'e `frames` + ANIM_DEFS'e `states` gir. Entegrasyon adımları bana (kod) bırakılabilir.
Boyutlar (192/320) mevcut manifestteki `frameWidth/frameHeight` değerleriyle uyumludur.
