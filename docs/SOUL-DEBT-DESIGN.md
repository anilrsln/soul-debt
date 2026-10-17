# Soul Debt — Tasarım Dokümanı

> Bu dosya oyunun **ne olduğunu** ve her kararın **neden** öyle alındığını tanımlar.
> Reddedilen alternatiflerin gerekçeleri için `DECISIONS.md`'ye bakın.
> Mevcut klon kodundan geçiş planı için `MIGRATION.md`'ye bakın.

## 1. Kimlik

**Oyun adı:** Soul Debt

**Tür:** Aktif descent tower defense. Bu bir idle oyun değildir, ancak idle türünden şu özellikleri miras alır: birimler otomatik savaşır, güç üstel olarak büyür, ilerleme kalıcıdır ve oyuncu uzakken oyun bir miktar ilerlemeye devam eder (ama bu süre zarfında durum kötüleşebilir). Oyuncu savaş sırasında ve savaş aralarında aktif kararlar verir; kaybetmek mümkündür.

**Köken:** Proje, Zero Stress King: Idle Defense oyununun klonu olarak başladı. Mevcut Phaser 3 kod tabanının yaklaşık %70'i (sahne mimarisi, manager sistemi, object pooling, i18n, save/load, dalga yönetimi, projectile sistemi) korunur. Oyunun kimliği ise tamamen özgünleştirilir: tema, ekonomi, savaş modeli ve kaybetme koşulu yeniden tasarlanır.

**Tema:** Ölü diriltmekten bıkmış, isteksiz bir necromancer, yeraltı dünyasının soul (ruh) ile beslenen tanrısını devirmeye karar verir. Necromancer her kat aşağı iner, yolundaki her yaratıktan ruh hasat eder, ordusunu bu ruhlarla kurar ve en dibe, tanrıya doğru ilerler. Necromancer'ın bıkkınlığı tüm ordusuna yansır: dirilttiği birimler de isteksizdir.

**Ton:** Kuru, bıkkın, kozmik-saçma mizah. Dünya kendini epik ve ciddiye alır; necromancer ve ordusu bu ciddiyete bıkkın tepkiler verir. Komedi bu kontrasttan doğar. Mizah dozajlıdır: her cümle şaka değildir, iyi yerleştirilmiş az sayıda kuru nokta kullanılır.

## 2. Hikâyenin Mekaniği Gerekçelendirmesi

Hikâye dekoratif değildir; her mekaniği gerekçelendirir.

- Necromancer bir soul hasatçısıdır, bu yüzden soul'un merkezi kaynak olması tematik olarak tutarlıdır.
- Tanrı soul ile beslenir, necromancer de soul toplar. Tanrıyı devirmek için tanrının yakıtını çalmak gerekir. Bu ironi, "her kat indikçe daha çok soul, en dipte tanrı" yapısını doğal kurar.
- Necromancer bir necromancer olduğu için ölüm onu durdurmaz. Savaşta ölürse yeniden doğar (prestige), biraz daha güçlü olarak. Bu, prestige'in neden tam sıfırlama yaptığını ve oyunun neden sonsuz döngü olduğunu hikâyeyle açıklar.

## 3. Lore Taşıma Yöntemi (Kesintisiz)

Oyun, oyuncuyu zorunlu olarak durduran hiçbir sinematik kullanmaz. Lore, oyun akışını kesmeyen kanallardan taşınır:

- **Boss banner'ları:** Kat bekçisi belirince ekranın üstünde kayan tek satırlık tanıtım. Bekçi kendini epik tanıtır, altında necromancer'ın kuru dipnotu yer alır. İki-üç saniye sonra kaybolur, oyun durmaz.
- **Bestiary (codex):** İsteğe bağlı, bir düşmana tıklayınca açılan kayıt ekranı. Mizahın asıl yaşadığı yer burasıdır. İsteyen oyuncu okur, istemeyen görmez.
- **Kat geçiş kartları:** Her yeni katta iki saniyelik, akışı kesmeyen bir ara metin (kat adı ve kısa bir tanım).
- **Idle dönüş popup'ı:** Oyuncu uzaktayken ne kazandığını gösteren mevcut ekran, necromancer'ın sesiyle yazılır.
- **İstisna:** Yalnızca oyundaki ilk boss karşılaşmasında, atlanabilir kısa bir tanıtım gösterilebilir (öğretici an). Sonraki tüm boss'lar yalnızca banner kullanır.

## 4. Ritim: Kat Döngüsü

Oyunun temel ritmi "10 dalga = 1 kat" döngüsüdür. Bu döngü, oyuna nefes alıp veren bir yapı kazandırır: savaş, ardından nefes/kurulum, ardından yeni savaş.

- Bir kat 10 dalgadan oluşur.
- Kat boyunca savaş kesintisizdir; dizilim sabittir, oyuncu mikro-yönetim yapmaz.
- 10. dalganın sonunda kat bekçisi (boss) belirir.
- Kat tamamlanınca bir **kat-arası kurulum fazı** açılır: necromancer'ın canı tamamen dolar, oyuncu ordusunu yeniden dizebilir, birim ekleyebilir veya çıkarabilir (absorbe).
- Oyuncu hazır olunca bir sonraki kata iner. Katlar derinleştikçe düşmanlar görsel ve sayısal olarak güçlenir.
- En dipte tanrı bulunur. Tanrıyı yenmek prestige'i tetikler.

## 5. Ekonomi

### 5.1 Soul (Evrensel Kaynak)

Soul oyunun merkezi ve evrensel birimidir. Eski EXP'nin yerini alır, ancak kapsamı çok daha geniştir. Soul aynı birimle şu şeyleri ifade eder:

- **Düşmanın değeri:** Daha güçlü düşman daha fazla soul taşır ve öldürülünce daha fazla soul düşürür.
- **Birimin gücü:** Her birim bir soul-kapasitesi taşır. Bu kapasite, birimin gücünü ve dayanıklılığını belirler. Yüksek soul-kapasiteli birim daha güçlüdür.
- **Harcama:** Upgrade'ler, tüm Conquest node'ları, birim örme ve birim diriltme — hepsi soul ile yapılır.

**Kazanım:** Soul yalnızca bir birimin bir düşmanı öldürmesiyle kazanılır.

**Risk/ödül dengesi (kritik sonuç):** Birimin gücü soul-kapasitesine bağlı olduğundan, güçlü bir birim (yüksek kapasite) daha fazla iş görür ama öldüğünde daha pahalıya diriltilir ve daha fazla soul-debt bindirir. Bu, "güçlü ama pahalı-kırılgan birim mi, zayıf ama ucuz-diriltilir birim mi" biçiminde otomatik bir stratejik denge yaratır. Bu denge, oyunun stratejik derinliğinin motorudur.

### 5.2 Dungeon Meta'ları

Soul'un yanında üç meta kaynağı bulunur. Bunlar eski Food kaynağının yerini alır ve genişletir. Meta'lar birim tipi *açmaz* (açma node'dan, soul ile olur — bkz. 5.2b); meta, bir birimi her **örerken** soul'un yanında harcanan ikincil kaynaktır. Her birim tipi belirli bir meta'ya bağlıdır: o tipten birim örmek o meta'yı tüketir. Her meta farklı bir düşman grubundan düşer ve farklı bir stratejik ekseni temsil eder.

| Meta | Kaynak | Bağlı birimler | Stratejik eksen |
|------|--------|----------------|-----------------|
| **Bone** | Yaygın düşmanların çoğu | Temel birim tipleri | Hacim: çok topla, geniş ordu ör |
| **Essence** | Nadir ve özel düşmanlar (kalkanlı, iyileştiren, elite) | Üst seviye birim tipleri | Seçicilik: zor düşman öldür, elit birim örmeyi sürdür |
| **Crystal** | Yalnızca kat bekçileri (boss) | En üst seviye birim tipleri, prestige | Kilometre taşı: boss'a ulaş, elit güç besle |

Bu yapı stratejiktir çünkü hangi düşmanı önceliklendirdiğin hangi meta'yı biriktirdiğini belirler, o da hangi birim tiplerini *örmeyi sürdürebildiğini* belirler. Meta tek seferlik bir eşik değil, süregiden bir talep olduğundan (Model 3) "Bone ordusu mu, Essence elitleri mi?" kararı oyun boyu canlı kalır.

### 5.2b Birim Yaratma Ekonomisi (Model 3)

> Not: Bu bölüm eski "Model 2"nin (tip açma = tek-seferlik meta) yerine geçer. Gerekçe: DECISIONS K18 + R13. Tek-seferlik meta kapısı meta'yı erken ölü kaynağa çeviriyordu.

Bir birim soul'dan örülür, bu yüzden birim örmek soul harcar — bu, 5.1'deki "soul birimin yapısında" ilkesinin doğrudan sonucudur: necromancer ruhtan beden örer. Ancak birim örmek yalnız soul değil, o birimin meta'sından da az miktarda tüketir. Böylece meta'nın kalıcı bir talebi olur ve oyun ilerledikçe ölü kaynağa dönüşmez.

Üç ayrı eylem, üç ayrı maliyet:

- **Birim tipini açmak** → Conquest **node'u** (soul + prerequisite node), bir kez. Meta harcanmaz. Açma, ayrı bir "birim mağazası" değil; node ağacının — oyunun tek ilerleme omurgasının — bir parçasıdır (DECISIONS K21).
- **O tipten birim örmek** → **ağır soul + az o-birimin-meta'sı** (Bone / Essence / Crystal), her seferinde.
- **Ölen birimi diriltmek** → soul (+ soul-debt), her seferinde.

Meta oranı "soul ağır + az meta" olarak ayarlanır: örme meta'yı yavaş ama sürekli tüketir, dar boğaz değil kalıcı bir baskı yaratır. Oyuncunun temel kararı hâlâ nettir — **"soul'umu bir node'a mı, yeni bir birim örmeye mi harcayayım?"** — ama artık ikincil bir eksen taşır: "essence-birimlerini örmeye devam edebilmek için yeterli essence topluyor muyum?" Bu, "bone ordusu mu essence elitleri mi?" build kararını (5.2) oyun boyu canlı tutar.

### 5.3 Soul'un İkili Rolü ve Onboarding

Soul hem harcanan kaynaktır hem de ilerleme ölçüsüdür. Harcadığın soul gider, ancak toplam topladığın soul (lifetime soul) ayrıca sayılır. Lifetime soul harcanmaz; yalnızca bir sayaçtır.

Oyuncu ilk kez ilk node'u almaya yetecek lifetime soul eşiğini geçtiğinde, oyun bir kez durur ve Conquest (node) ekranını açar. Bu, oyuncuya soul'u nereye harcayabileceğini gösteren tek seferlik bir öğreticidir. Hangi node'u alacağına — hatta alıp almayacağına — yine oyuncu karar verir; bu yalnızca ekranı bir kez tanıtan bir andır. Sonraki hiçbir eşikte oyun durmaz.

## 6. Savaş Modeli

### 6.1 Dur-Dövüş

Düşman bir birime ulaştığında durur ve karşılıklı dövüşürler. İkisi de HP kaybeder, biri ölene kadar. Bu, ön saf ve arka saf oyununu anlamlı kılar: dayanıklı bir tank birimi önde düşmanı bloklar, hasar veren birimler arkada güvenle vurur. Bu nedenle kadroda en az bir blokçu/tank arketipi bulunması zorunludur (MVP'de bu rol Taş Golem; bkz. 8.1).

### 6.2 Dizilim

Oyuncu birimlerini kendisi yerleştirir. Dizilim yalnızca kat-arası kurulum fazında değiştirilebilir; kat içindeki savaş sırasında dizilim sabittir. Bu kasıtlıdır: oyun bir refleks oyunu değil, bir planlama oyunudur. Oyuncu "bir sonraki kat kalkanlı düşman ağırlıklı, tankı öne alayım" biçiminde kat öncesi planlı karar verir, savaş kaosunda panik tıklama yapmaz.

### 6.3 Birim Ölümü ve Otomatik Diriltme

Birimler gerçekten ölebilir. Bir birim öldüğünde necromancer onu **yerinde** otomatik olarak yeniden diriltir. Oyun hiçbir yere geri sarmaz: dalga devam eder, kat devam eder, yalnızca o tek birim kısa bir cooldown sonrası tekrar ayağa kalkar — ölmeden önceki gücüyle (birimin soul-kapasitesi sabittir, güçsüzleşerek dirilmez). Oyuncunun manuel diriltme yapması gerekmez. Otomatik diriltme sayesinde oyuncu uzaktayken bile ordu tamamen dağılmaz; necromancer arka planda dirilmeye devam eder.

Birim ölümü ile koşu sıfırlama **tamamen ayrı katmanlardır:** tek bir birimin ölmesi (hatta tüm ordunun ölmesi) oyunu başa döndürmez. Oyunu yalnızca necromancer'ın canının tamamen bitmesi sıfırlar (bkz. 6.5 ve 7).

### 6.4 Soul-Debt (Üç Katmanlı Ceza)

Diriltmenin bedeli üç katmanlıdır. Bu üç katman birlikte, ölümü gerçek bir ceza yapar ve ölüm spiraline karşı doğal bir fren oluşturur.

1. **Anlık soul maliyeti:** Her diriltme, o anda elindeki soul'dan keser. Daha güçlü (yüksek kapasiteli) birim daha pahalı diriltilir.
2. **Diriltme cooldown'u:** Birim öldükten hemen sonra değil, kısa bir süre sonra kalkar. Bu boşlukta hat zayıflar ve soul üretimi düşer.
3. **Artan borç (soul-debt):** Üst üste hızlı ölümler biriken bir soul borcu yaratır. Her diriliş bir öncekinden daha pahalı olur. Borç, zamanla ve düşman öldürdükçe azalır. Çok ölüm borcu şişirir, bu da oyuncuyu "daha az ama daha dayanıklı birim" oynamaya iter. Bu mekanik, oyunun adının (Soul Debt) karşılığıdır.

### 6.5 Hat İhlali ve Necromancer'ın Canı

Necromancer sahnede somut bir varlıktır ve bir can (dayanıklılık) havuzu taşır. Bir düşman tüm birimleri aşıp hattı ihlal ederse, necromancer'a ulaşır: necromancer'ın canından keser ve ayrıca soul-debt bindirir. Necromancer'ın canı şu şekilde yönetilir:

- Her 10 dalgada bir (kat sonunda) can tamamen dolar.
- Oyuncu soul harcayarak maksimum canı kalıcı olarak (koşu içinde) artırabilir. Bu, "saldırı mı dayanıklılık mı" biçiminde bir soul harcama kararı yaratır.

Necromancer'ın canı sıfırlanırsa koşu sona erer (bkz. 7).

## 7. Kaybetme ve Prestige

### 7.1 Prestige Nedir

Prestige, oyuncunun koşu-içi tüm ilerlemesini sıfırlayıp karşılığında kalıcı bir çarpan kazanmasıdır. Sıfırlanan şeyler: soul, meta'lar, upgrade'ler, birim adetleri, kat ilerlemesi. Kalıcı kalan şeyler: prestige çarpanı ve node ile açılmış birim *tipleri* (tip kilidi kalıcıdır, o tipten kaç adet olduğu koşu-içidir). Prestige sonrası necromancer Kat 1'den, daha güçlü olarak yeniden iner. Checkpoint veya ara seviyeden devam yoktur; prestige her zaman tam sıfırlamadır.

### 7.2 İki Prestige Yolu

- **Gönüllü prestige:** Oyuncu en dibe iner ve tanrıyı yener. Bu bir zafer anıdır ve **tam** kalıcı çarpan verir.
- **Zorlanmış prestige:** Necromancer savaşta ölür. Oyun onu mecburen aynı sıfırlamaya sokar. Bu bir başarısızlık anıdır ve gönüllü prestige'in verdiğinin **yarısı** kadar kalıcı çarpan verir. Ölüm bir kayıptır ama kurtarılabilir bir kayıptır: her şey uçmaz, yine de biraz güçlenirsin.

Bu fark kasıtlıdır. Eğer iki yol aynı ödülü verseydi, oyuncu tanrıya inmek yerine bilerek ölmeyi bir kısayol olarak kullanırdı ve oyunun asıl hedefini atlardı. Zorlanmış prestige'in daha az ödül vermesi, oyuncuyu ölmeden önce gönüllü prestige etmeye (yani ileri görüşlü oynamaya) teşvik eder.

### 7.3 Çarpan Modeli (Model Y — Derinliğe Bağlı)

Prestige çarpanı sabit değildir; ulaşılan derinliğe (kat sayısına) bağlıdır. Daha derine inmek, hem gönüllü hem zorlanmış prestige'de daha fazla kalıcı çarpan verir. Bunun sonucu: bir boss'un dibinde ölmek bile ciddi bir çarpan verir, çünkü oraya kadar derine inmişsindir; erken ölmek az verir. Bu model, oyuncuyu ölecek olsa bile mümkün olduğunca derine inmeye iter ve iniş temasını doğrudan ödül sistemine bağlar.

### 7.4 Boss Fight'ta Ölüm (Örnek Akış)

Boss fight bu açıdan özel değildir. Necromancer boss katında ölürse: koşu sıfırlanır, ulaşılan derinliğe bağlı çarpanın yarısı kadar kalıcı güç kazanılır, necromancer Kat 1'den yeniden doğar. Böylece boss bir duvar işlevi görür: ya yeterince güçlenip geçersin, ya ona çarpıp zayıf-prestige ile geri döner, güçlenir ve tekrar gelirsin.

## 8. Kadro

### 8.1 Birimler (MVP: 5 adet; hedef kadro sonra genişler)

Çekirdek önce çalışsın diye MVP 5 birimle başlar (8 değil); eksik görülürse eklenir (DECISIONS K22). Dağılım rol-merkezlidir ve dur-dövüşün dört ihtiyacını karşılar: blokla / tek-hedef-erit / kalabalık-biç / ayakta-tut. Her birimin bir soul-kapasitesi vardır; bu kapasite gücünü, dayanıklılığını ve diriltme maliyetini belirler. Birim *tipleri* node ağacından açılır (soul); açıldıktan sonra her tipten birim soul + o birimin meta'sıyla örülür (Model 3, 5.2b).

| # | Birim (çalışma adı) | Rol | Soul-kapasite | Örme meta'sı |
|---|---|---|---|---|
| 1 | İskelet Bruiser | Ön-saf hasar/blok karışımı — yarı-tank ama pasif durmaz, döver | Orta-yüksek | Bone |
| 2 | İskelet Okçu | Uzak tek-hedef DPS — ucuz, çok öl-dirilt, borç düşük | Düşük | Bone |
| 3 | Hasar Büyücüsü | Alan hasarı (AoE) — kalabalık dalgaları biçer | Orta | Bone |
| 4 | Healer Büyücü | Destek — birim HP yenileme, ön safı ayakta tutar | Orta | Essence |
| 5 | Taş Golem | Asıl tank — taunt ile birden çok düşmanın ilgisini çeker, aynı anda birkaçıyla dövüşür | Yüksek | Essence |

**Meta dağılımı (MVP):** 3 Bone + 2 Essence. Crystal MVP'de kullanılmaz (yalnız kat bekçilerinden düşer, boss sistemi geç faz). Böylece oyuncu ilk boss'a ulaşmadan tüm MVP kadrosunu açabilir.

**Rol mantığı:** Taş Golem taunt'la 2-3 düşmanı tutarken arkadaki okçu (2) ve büyücü (3) güvenle vurur; bruiser (1) golemin yanında ön safı destekler veya golem düşerse boşluğu tutar; healer (4) ön safı ayakta tutarak dur-dövüşü sürdürülebilir kılar. Beş birim beş ayrı iş yapar, hiçbiri fazlalık değildir.

**Healer dengesi (izlenecek):** Healer birim-HP'sini yeniler, necromancer canını değil — yani hat-ihlali cezası (6.5) ve soul-debt (6.4) işlemeye devam eder; healer yalnız birim ölüm sıklığını düşürür. Klasik ve gerekli bir TD rolü, ama playtest'te "healer ölüm cezasını tümden siliyor mu?" diye bakılır.

**Golem taunt'u (teknik uyarı):** Çoklu-hedef taunt, dur-dövüş kodunun en karmaşık parçasıdır (bir birim ↔ birden çok düşman eşleşmesi; normal model 1↔1'dir). Faz E'yi ağırlaştırır. MVP'de taunt basit tutulur (golem tek düşman tutar + çok yüksek HP); çoklu-hedef taunt çekirdek çalışır hale gelince açılır.

**Sonraki kadro adayları (park):** Diriltici/Çürütücü tipi ikinci destek ve Crystal-kademe elit birimler, çekirdek çalıştıktan sonra playtest ile değerlendirilir.

### 8.2 Düşmanlar (Arketip + Kat Varyantı Modeli)

Oyun sonsuza gittiği için her 10 dalgada yeni bir düşman tipi tasarlamak sürdürülemez. Bunun yerine sınırlı sayıda mekanik arketip ve bunların kat-temalı varyantları kullanılır:

- Toplam yaklaşık 10-12 mekanik arketip bulunur (tank, hızlı, kalkanlı, bölünen, iyileştiren, zırhlı ve benzeri). Mevcut 8 düşman tipi temel alınır, 3-4 yeni arketip eklenir.
- Her kat bu arketipleri yeniden temalandırır ve güçlendirir. Örneğin Kat 1'in kalkanlı iskeleti, Kat 4'te kalkanlı taş gargoyle olur: aynı mekanik, yeni görsel, daha yüksek stat. Oyuncu yeni düşman geldiğini hisseder, ancak yeni mekanik yazılmaz; yalnızca config varyantı ve asset değişir.
- Düşman çeşitliliğinin asıl kaynağı kombinasyondur. Dalga ilerledikçe arketipler aynı dalgada karıştırılır (kalkanlı ve hızlı birlikte). Derinlik, lineer tip eklemeden değil, kombinasyondan gelir.

### 8.3 Boss'lar (Kat Bekçileri)

Her 10 dalgada bir kat bekçisi (boss) belirir. Beş boss rotasyonu temel alınır ve katlara göre görsel/sayısal olarak varyantlanır. Boss'lar Crystal meta'sının tek kaynağıdır.

### 8.4 Kısmi-İadeli İsteğe Bağlı Absorbe

Kat-arası kurulum fazında oyuncu bir birimi geri emebilir (absorbe). Bu absorbe isteğe bağlıdır ve birimin meta maliyetinin yalnızca bir kısmını (örneğin %50-70) geri verir. Tam iade bilinçli olarak reddedilmiştir: tam iade, her kat başında bedelsiz yeniden kurulum yaratır, bu da meta ekonomisini ve dizilim planlamasını anlamsızlaştırır. Kısmi iade, yeniden kurulumu mümkün kılar ama maliyetli yapar, böylece planlama ciddiye alınır ve necromancer'ın absorbe teması korunur.

## 9. Korunan ve Değişen Kod

**Korunan (~%70):** Sahne mimarisi (Boot/Menu/Game/UI/Conquest), manager sistemi, WaveManager, EconomyManager, UpgradeManager, ConquestManager, object pooling, i18n altyapısı, save/load, prestige iskeleti, idle gelir, combo, achievement, syncDefenders deseni, projectile sistemi.

**Değişen veya yeni:** Ölüm ve ödül mantığı (tamamen yeniden), para birimleri (EXP→Soul, Food→üç meta), tema ve asset (tamamen yeni), necromancer varlığı ve canı (yeni), soul-debt sistemi (yeni), dur-dövüş ve lane-blocking (yeni), oyuncu-dizilimli kurulum fazı (yeni), kat döngüsü ritmi (yeni), Model 3 birim ekonomisi (yeni).

**Kaldırılan:** Lava mekaniği tamamen kaldırılır. `dieToLava()`, `dieToWall()`, `getLavaExpRate()`, `drawLava()` ve `CONFIG.LAVA_X` runtime override silinir. Bunların yerini tek bir "hat ihlali" olayı alır (düşman WALL_X'i geçer, necromancer'a ulaşır).

## 10. Park Listesi (v2 — Şimdi Tasarlanmaz)

Bu fikirler kayıt altındadır ancak çekirdek çalışır hale gelene kadar tasarlanmaz. Çalışan bir oyun üzerine, playtest ile eklenirler.

- **Unit kıdem/veteran sistemi (Yol B):** Birimler savaştıkça (öldürdükçe, kat geçtikçe) kalıcı güç kazanır. Bu, "ordu zamanla güçlenir" temasını ölümü ödüllendirmeden verir; kıdemli birimi kaybetmek gerçek bir kayıp olduğundan ölüm cezasını güçlendirir.
- Aktif soul-gücü (oyuncunun tıklayıp harcadığı yetenek).
- Necromancer canı için otomatik-tamir node'u (can eşik altına düşünce soul harcar).
- Ara seviye / checkpoint sistemi.
- Pixel art asset'lerine tam geçiş.
- Ses efektleri ve müzik.
- Roguelite yönünde derinleştirme.

## 11. Açık Noktalar (Sonra Çözülecek)

- **4-sayaç UI düzeni:** Soul ve üç meta ekranda dört sayaç demektir. Ekran kalabalığı yönetilmeli.
- **Save uyumluluğu:** Ekonomi ve mekanik baştan değiştiği için eski save'ler uyumsuzdur. Save version bump ve temiz başlangıç gerekir. Tek oyuncu olduğundan risk düşüktür.
- **i18n lore yükü:** MVP'de 5 birim (hedef kadro sonra genişler), yaklaşık 12 düşman arketipi, kat temaları, boss banner'ları ve bestiary hem TR hem EN yazılacaktır. Mizah birebir çevrilemez, iki dil ayrı yazılır. Bu ayrı bir iş kalemidir ve kendi fazını hak eder.
