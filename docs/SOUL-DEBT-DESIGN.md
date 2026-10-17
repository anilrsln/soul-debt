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
- Necromancer bir necromancer olduğu için ölüm onu durdurmaz. Savaşta ölürse yeniden doğar (prestige), biraz daha güçlü olarak. Bu, prestige'in neden tam sıfırlama yaptığını hikâyeyle açıklar. (Oyunun bir hedefi/sonu vardır — en dipteki tanrıyı yenmek; bkz. 4 ve 7. Sonsuz döngü değil, sonlu-ama-tekrarlanabilir bir yapı.)

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
- Kat tamamlanınca bir **kat-arası kurulum fazı** açılır: necromancer'ın canı tamamen dolar, **tüm birimlerin canı yenilenir**, oyuncu ordusunu yeniden dizebilir, birim ekleyebilir veya çıkarabilir (absorbe). Not: Can yenilenir ama diriltme kuyruğu ve biriken soul-debt DEVAM eder — kat sonu bir nefes anıdır, borç affı değil (soul-debt cezası K11 korunur).
- Oyuncu hazır olunca bir sonraki kata iner. Katlar derinleştikçe düşmanlar görsel ve sayısal olarak güçlenir.
- **Önceden belirli bir Kat N'de** (en dip) tanrı bulunur. Oyun saf-sonsuz değildir; tanrıya ulaşmak bir hedeftir. N bir placeholder'dır (playtest ile ayarlanır — ör. Kat 10 ≈ 100 dalga).
- Tanrıyı yenmek oyunun **zafer/sonu**dur ve gönüllü prestige'i tetikler (bkz. 7). Zaferden sonra oyuncuya "tekrar oyna" ve "endless devam" seçeneği sunulur (endless + New Game+ ayrıntısı park'ta — bkz. 10).

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

Düşman bir birime ulaştığında durur ve karşılıklı dövüşürler. İkisi de HP kaybeder, biri ölene kadar.

**Hedefleme kuralı:** Düşman necromancer'a doğru ilerler ve **yoluna çıkan ilk birime** çarpıp durur (en yakına değil — yoluna çıkana). Bunun sonucu: konumlandırma gerçek bir karardır. Oyuncu dayanıklı bir birimi düşman yoluna koyarsa onu bloklar ve arkadaki kırılgan birimler (okçu/büyücü) güvende vurur; tankı yola koymazsa düşman doğrudan arkadaki kırılgan birime ulaşır. Bu nedenle kadroda en az bir blokçu/tank arketipi bulunması zorunludur (MVP'de bu rol Taş Golem; bkz. 8.1). "Ön/arka saf" kavramı burada lane'lerden değil, oyuncunun serbest yerleştirmesinden (6.2) doğar: önde olan, düşman yoluna daha yakın konumlanandır.

### 6.2 Yerleştirme ve Ankerli Otonomi

**Bu bir lane/saf-dizme oyunu değildir.** Birimler ızgaraya veya şeritlere dizilmez; oyuncu her birimi oyun alanında **istediği (x, y) noktasına** serbestçe yerleştirir. Bu nokta birimin **çıpasıdır** (anchor).

**Örme ve yerleştirme savaşta da açıktır — ama opsiyoneldir (K28):** Oyuncu hem kat-arası kurulum fazında hem de savaş sırasında yeni birim örüp serbestçe yerleştirebilir (ör. hat çöküyorsa acil bir tank örüp boşluğa koymak). Bu **zorunlu değildir**: oyuncu hiç dokunmazsa mevcut ordu + necromancer idle olarak hattı tutmaya devam eder (K4 idle mirası). Fark kritiktir — refleks oyunu müdahaleyi *zorunlu* kılar; Soul Debt müdahaleyi *ödüllü* kılar: tıklarsan daha iyi oynarsın, tıklamazsan idle olarak idare edersin. Böylece idle sözleşmesi korunurken üstüne opsiyonel aktif stratejik derinlik eklenir.

**Kapsam:** Savaşta serbest yerleştirme yeni örülen (ve istenirse yeni konumlanan) birimler içindir. Mevcut birimler savaşta çıpalarında kalır (ankerli otonomi dairesi dışında taşınmaz); asıl ince dizilim ve absorbe kat-arası kurulum fazında yapılır — orası savaşta aceleyle koyulanı düzeltme/optimize etme anıdır. Yani savaşta yerleştirme "kaba/acil", kat-arası faz "ince ayar"dır.

**Ankerli otonomi:** Savaş sırasında birim çıpasına çakılı durmaz; çıpa merkezli küçük bir **otonomi dairesi** içinde kendi kendine hareket eder. Bu hareket birimin rolünü *yerine getirmek* içindir, oyuncunun yerleşimini *geçersiz kılmak* için değil:

- Menzilli birim, menzilindeki düşmana hizalanmak için daire içinde kayar/nişan alır.
- Ön çıpadaki birim ölünce yakınındaki birim boşluğu kapatmak için daire içinde öne adımlar.
- Üst üste binen birimler hafifçe ayrışır (görsel düzen).
- Tehdit geçince birim çıpasına geri döner.

Birim **çıpanın otonomi dairesinden asla çıkmaz**. Böylece oyuncunun yerleşimi belirleyici kalır (planlama oyunu kimliği korunur), ama birimler savaşta cansız-sabit değil, canlı ve tepkiseldir. Otonomi dairesinin yarıçapı ne çok büyük ne çok küçük olmalı; başlangıç placeholder'ı ≈ ekran yüksekliğinin 1/10–1/20'si (playtest ile ayarlanır).

**Yerleşme animasyonu:** Oyuncu bir çıpa noktası seçtiğinde birim oraya ışınlanmaz, yürüyerek gider.

**Neden bu model (K9 ile ilişki):** K9'un özgün "dizilim savaşta tamamen sabit" ifadesi iki kez yumuşatıldı: önce çıpa-sabit + yerel-otonom (K24), sonra savaşta opsiyonel örme/yerleştirme (K28). Oyun hâlâ bir planlama oyunudur — ana strateji çıpaları konumlandırmakla kurulur ve savaşta panik *zorunlu değildir* — ama artık isteyen oyuncu savaşta da müdahale edebilir. K9'un asıl amacı "oyuncu kaybetmemek için panik tıklamak zorunda kalmasın" idi; bu korunur (idle oyuncu dokunmadan idare eder). Lane tabanlı "arka arkaya diz" stratejisi bilinçle reddedildi.

**Faz sırası (teknik):** Faz E'de önce saf çıpa-sabit (hareketsiz) dur-dövüş çalıştırılır; ankerli otonomi bir **cila katmanı** olarak üstüne eklenir. Otonomi kodu olmasa da oyun oynanabilir kalır — çekirdek bağımlılığı değildir.

### 6.3 Birim Ölümü ve Otomatik Diriltme

Birimler gerçekten ölebilir. Bir birim öldüğünde necromancer onu **yerinde** otomatik olarak yeniden diriltir. Oyun hiçbir yere geri sarmaz: dalga devam eder, kat devam eder, yalnızca o tek birim kısa bir cooldown sonrası tekrar ayağa kalkar — ölmeden önceki gücüyle (birimin soul-kapasitesi sabittir, güçsüzleşerek dirilmez). Oyuncunun manuel diriltme yapması gerekmez — bu idle güvenliğinin temelidir (AFK'de bile ordu dağılmaz; saf-manuel diriltme bilinçle reddedildi, bkz. DECISIONS R3). Otomatik diriltme sayesinde oyuncu uzaktayken bile necromancer arka planda dirilmeye devam eder.

**Opsiyonel manuel öncelik (K29):** Oto-diriltme varsayılandır, ama oyuncu isterse diriltme kuyruğuna müdahale edebilir — "önce şu tankı dirilt" diye öncelik verir, ya da "şu pahalı birimi şimdilik erteleyip soul biriktir" der. Bu müdahale zorunlu değildir (dokunmazsan sistem sırayla diriltir), ama doğru sırayı seçmek stratejik derinlik verir. Böylece idle tabanı (AFK güvenli) ile aktif derinlik (öncelik yönetimi) birlikte yaşar — K28 felsefesiyle aynı. Bu yetenek ileride bir node'dan açılabilir (erken oyun saf-oto/basit, ileri oyun öncelik-yönetimli/derin — K21 ile uyumlu).

**Diriltme vs yeni örme sırası:** Diriltme kuyruğu ve yeni birim örme aynı anda tetiklenebilir; hangisi önce aktive edildiyse önce gerçekleşir (FIFO). İkisi de object pool'dan birim çeker — sıra pooling'i etkilemez, yalnızca öncelik meselesidir (havuz boşsa FIFO sırası devreye girer).

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

### 6.6 Necromancer Bir Birim Olarak (Başlangıç Silahı + Son Hat)

Necromancer yalnız bir can havuzu değil; aynı zamanda oyunun **başlangıç birimidir** ve damage verir. Klon kökeninde ilk birim `laser` (sabit, menzilli, upgrade'lenen başlangıç kulesi) idi; o rol Soul Debt'te necromancer'a taşınır. Necromancer hiring gerektirmez, oyun boyunca hep sahnededir.

- **Sabit konumlu, menzilli, upgrade'lenen.** Necromancer en arkada (korunan konumda) durur ama menzili sayesinde öne gelen düşmanlara uzaktan ruh fırlatarak damage verir. Soul ile damage/menzil/ateş-hızı upgrade'lenir (node + upgrade kolları — K21).
- **Çift rol, çelişkisiz.** Necromancer hem damage verir (menzilli, arkada) hem de kaybetme koşuludur (6.5): düşman hattı aşıp *ona ulaşırsa* canından yer. Böylece necromancer son savunma hattıdır — önündeki ordu çökse bile bir süre kendi menziliyle direnir, ama düşman üstüne gelirse canı erir. Lore: bıkkın necromancer ordusunu öne sürer, geride ruhları yönetir, ama köşeye sıkışınca isteksizce elini kirletir.
- **Hedefleme (yönlendirilebilir):** Varsayılan olarak necromancer **en yakın düşmana** vurur (otomatik — idle sözleşmesi, oyuncu hiçbir şey yapmasa da savaşır). Oyuncu bir düşmanı **tıklarsa**, necromancer o düşmanı **yapışkan** biçimde hedefler: hedef ölene (ya da menzilden çıkana) kadar ona vurur, sonra otomatiğe (en yakın) döner. Bu, alan-koruması stratejisini (serbest yerleştirme + topografya) "şu tehlikeli düşmanı öncelikle temizle" komutuyla destekler. Sürekli mikro değil, ara sıra bir *komutan dokunuşu* — idle+planlama kimliği (K4/K9) korunur.
- **Kapsam:** Hedef-yönlendirme yalnız necromancer'a özeldir. Diğer menzilli birimler (okçu, hasar büyücüsü) otomatik hedefler; hepsini ayrı yönlendirmek mikro-yönetim kaosu olurdu (park'ta değerlendirilebilir).
- **UX notu:** Tıklanan düşmanda görsel hedef işareti (halka vb.) olmalı ki oyuncu necromancer'ın neyi hedeflediğini görsün. Faz C/D detayı.

**Aktif yetenekler (sonraki faz, MVP değil):** Necromancer ileride node'dan açılan, soul maliyetli + cooldown'lu, ara sıra kullanılan aktif yetenekler kazanabilir (ör. lanetle, yavaşlat, ruh patlaması). Bunlar idle sözleşmesini bozmaz (sürekli değil, kritik anda isteğe bağlı). **MVP'ye girmez** — çekirdek (dur-dövüş, ekonomi, soul-debt) çalışınca eklenir; aksi halde yeni input/cooldown/hedef-seçim sistemleri çekirdekten önce yük olur. Necromancer'ın temel damage hali (laser yerine geçiş) ise MVP'ye girer.

## 7. Kaybetme ve Prestige

### 7.1 Prestige Nedir

Prestige, oyuncunun koşu-içi tüm ilerlemesini sıfırlayıp karşılığında kalıcı bir çarpan kazanmasıdır. Sıfırlanan şeyler: soul, meta'lar, upgrade'ler, birim adetleri, kat ilerlemesi. Kalıcı kalan şeyler: prestige çarpanı ve node ile açılmış birim *tipleri* (tip kilidi kalıcıdır, o tipten kaç adet olduğu koşu-içidir). Prestige sonrası necromancer Kat 1'den, daha güçlü olarak yeniden iner. Checkpoint veya ara seviyeden devam yoktur; prestige her zaman tam sıfırlamadır.

**Sonluluk notu:** Oyun saf-sonsuz değildir. Tanrı önceden belirli Kat N'dedir (4). Gönüllü prestige (tanrıyı yenmek) oyunun hedefine ulaşmaktır ve bir **zafer** anıdır: zafer ekranı gösterilir, sonra oyuncu "tekrar oyna" veya "endless devam" seçebilir. Zorlanmış prestige (necromancer ölümü) ise yolun ortasında bir başarısızlık-reset'idir (7.2). Yani prestige iki bağlamda gelir: hedefe varınca (zafer) veya ölünce (başarısızlık). Endless mod ve New Game+ döngüsünün ayrıntısı park'tadır (10).

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

> Not: Bu 5 birim oyuncunun *dizdiği* orduyu oluşturur. Bunlara ek olarak **necromancer** sabit bir başlangıç birimidir (hiring yok, hep sahnede; damage verir + can havuzu + kaybetme koşulu — bkz. 6.6). Yani sahada fiilen 5 dizilebilir birim + 1 sabit necromancer bulunur.

**Meta dağılımı (MVP):** 3 Bone + 2 Essence. Crystal MVP'de kullanılmaz (yalnız kat bekçilerinden düşer, boss sistemi geç faz). Böylece oyuncu ilk boss'a ulaşmadan tüm MVP kadrosunu açabilir.

**Rol mantığı:** Taş Golem taunt'la 2-3 düşmanı tutarken arkadaki okçu (2) ve büyücü (3) güvenle vurur; bruiser (1) golemin yanında ön safı destekler veya golem düşerse boşluğu tutar; healer (4) ön safı ayakta tutarak dur-dövüşü sürdürülebilir kılar. Beş birim beş ayrı iş yapar, hiçbiri fazlalık değildir.

**Healer dengesi (izlenecek):** Healer birim-HP'sini yeniler, necromancer canını değil — yani hat-ihlali cezası (6.5) ve soul-debt (6.4) işlemeye devam eder; healer yalnız birim ölüm sıklığını düşürür. Klasik ve gerekli bir TD rolü, ama playtest'te "healer ölüm cezasını tümden siliyor mu?" diye bakılır.

**Golem taunt'u (teknik uyarı):** Çoklu-hedef taunt, dur-dövüş kodunun en karmaşık parçasıdır (bir birim ↔ birden çok düşman eşleşmesi; normal model 1↔1'dir). Faz E'yi ağırlaştırır. MVP'de taunt basit tutulur (golem tek düşman tutar + çok yüksek HP); çoklu-hedef taunt çekirdek çalışır hale gelince açılır.

**Sonraki kadro adayları (park):** Diriltici/Çürütücü tipi ikinci destek ve Crystal-kademe elit birimler, çekirdek çalıştıktan sonra playtest ile değerlendirilir.

### 8.2 Düşmanlar (Yeraltı Yaratıkları — Arketip + Kat Varyantı Modeli)

**Tema ayrımı (önemli):** Necromancer'ın *kendi ordusu* iskeletlerden/dirilmişlerden oluşur (bkz. 8.1) — iskelet estetiği bizim tarafın imzasıdır. Düşmanlar ise necromancer'ın inerken savaştığı **yeraltı yaratıklarıdır**: etli/çürük, taş, ruhsal, lanetli varlıklar. Bu ayrım hem tematik tutarlıdır (necromancer düşmanı öldürüp kendi ordusuna katar) hem de pratik bir okunabilirlik sorununu çözer: birim ve düşman asla aynı görünmez (DECISIONS K23).

**Başlangıç kadrosu — 8 arketip** (mevcut klon mekanikleri korunur, yalnızca tema/isim/anahtar yeniden yazılır; sıfır denge riski):

| Anahtar (config) | Görünen ad (TR / EN) | Mekanik | Menzil |
|---|---|---|---|
| `ghoul` | Gulyabani / Ghoul | Zayıf, düz — taban düşman | Melee |
| `gargoyle` | Taş Gargoyle / Stone Gargoyle | Yüksek HP, yavaş | Melee |
| `imp` | İmp / Imp | Hızlı, kırılgan | Melee |
| `soulVessel` | Ruh Kesesi / Soul Vessel | Ölünce bol meta (bone bonusu) düşürür | Melee |
| `cursedKnight` | Lanetli Şövalye / Cursed Knight | Yüksek HP + yüksek ödül (elit) | Melee |
| `warden` | Kalkanlı Muhafız / Shield Warden | Kalkan ilk darbeleri emer | Melee |
| `ooze` | Jöle / Ooze | Ölünce küçük kopyalara bölünür | Melee |
| `cultist` | Kültist / Cultist | Menzilindeki yaratıkları iyileştirir (destek) | Menzilli-destek |

Not: 8'in 7'si melee dövüşçü; `cultist` tek menzilli (ama saldırgan değil, destek). Saf menzilli-saldırgan düşman şimdilik yok — bkz. 10 (park).

**Kat varyantı modeli:** Oyun sonlu ama uzundur (Kat N'e kadar çok sayıda kat); her kata elle yeni düşman tipi tasarlamak yine sürdürülemez (DECISIONS R2). Bunun yerine bu arketipler kat temasıyla yeniden-görselleştirilir ve güçlendirilir. Örneğin Kat 1'in Kalkanlı Muhafız'ı, Kat 4'te daha iri ve yüksek-statlı bir taş variantına döner: aynı mekanik, yeni görsel, daha yüksek stat. Oyuncu yeni düşman geldiğini hisseder ama yeni mekanik yazılmaz; yalnızca config varyantı ve asset değişir.

**Çeşitliliğin asıl kaynağı kombinasyondur:** Dalga ilerledikçe arketipler aynı dalgada karıştırılır (kalkanlı + hızlı birlikte). Derinlik, lineer tip eklemeden değil kombinasyondan gelir.

**Boss isimlendirmesi:** 5 boss şu an jenerik kodda (`boss_tank`, `boss_berserker`, `boss_shaman`, `boss_splitter`, `boss_armored`). Bunlar Faz G'de lore (banner + bestiary) ile birlikte temalı isim alır — isim ve kuru-mizah dipnotu bir arada yazılsın diye o faza bırakıldı.

### 8.3 Boss'lar (Kat Bekçileri)

Her 10 dalgada bir kat bekçisi (boss) belirir. Beş boss rotasyonu temel alınır ve katlara göre görsel/sayısal olarak varyantlanır. Boss'lar Crystal meta'sının tek kaynağıdır.

### 8.4 Kısmi-İadeli İsteğe Bağlı Absorbe

Kat-arası kurulum fazında oyuncu bir birimi geri emebilir (absorbe). Bu absorbe isteğe bağlıdır ve birimin örme maliyetinin — hem **soul hem meta** (Model 3'te örme ikisini de harcar, 5.2b) — yalnızca bir kısmını (örneğin %50-70, placeholder) geri verir. (Diriltme ise yalnız soul harcar, meta değil — bu yüzden absorbe-iadesi örmeye özgüdür.) Tam iade bilinçli olarak reddedilmiştir: tam iade, her kat başında bedelsiz yeniden kurulum yaratır, bu da meta ekonomisini ve dizilim planlamasını anlamsızlaştırır. Kısmi iade, yeniden kurulumu mümkün kılar ama maliyetli yapar, böylece planlama ciddiye alınır ve necromancer'ın absorbe teması korunur.

## 9. Korunan ve Değişen Kod

**Korunan (~%70):** Sahne mimarisi (Boot/Menu/Game/UI/Conquest), manager sistemi, WaveManager, EconomyManager, UpgradeManager, ConquestManager, object pooling, i18n altyapısı, save/load, prestige iskeleti, idle gelir, combo, achievement, syncDefenders deseni, projectile sistemi.

**Değişen veya yeni:** Ölüm ve ödül mantığı (tamamen yeniden), para birimleri (EXP→Soul, Food→üç meta), tema ve asset (tamamen yeni), necromancer varlığı ve canı (yeni; eski `laser` başlangıç kulesinin damage rolü necromancer'a taşınır, + yönlendirilebilir hedefleme — bkz. 6.6), soul-debt sistemi (yeni), dur-dövüş ve lane-blocking (yeni), oyuncu-dizilimli kurulum fazı (yeni), kat döngüsü ritmi (yeni), Model 3 birim ekonomisi (yeni).

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
- **Endless mod + New Game+ döngüsü:** Tanrı yenildikten sonra devam. Basit endless (katlar artarak sürer) veya New Game+ (necromancer ve tanrı birlikte güçlenerek yeni döngü). MVP'de yalnız zafer + "tekrar oyna"/"endless" seçeneği var; bu modların denge ve prestige ayrıntısı sonra.
- **Çoklu harita arketipleri:** Dar boğaz / çatal / meydan / engelli gibi ayrı topografik şablonlar + prosedürel/temalı varyant (düşman K17 modelinin harita versiyonu). MVP tek yıkıntı-dungeon zemini kullanır (12.1); bu, serbest yerleştirme kanıtlandıktan sonra eklenir.
- **A\* grid pathfinding:** Düşman akışını "yönel + engelden kaç" (12.2) yerine tam en-kısa-yol hesabına yükseltmek. Daha akıllı ama pahalı; ancak haritalar karmaşıklaşırsa gerekir.
- **Menzilli saldırgan düşman:** Dur-dövüş sözleşmesini kıran (durmadan, arka saftaki kırılgan birimi uzaktan vuran) bir düşman. Güçlü ama "sıçrayıcı/arka-saf sızan" arketipiyle aynı oyunsal problemi (ön safı anlamsızlaştırma baskısı) çözer — ikisi birden rol çakışır. Çekirdek dur-dövüş çalışınca playtest'le "menzilli mi sıçrayıcı mı arka-saf baskısını daha iyi veriyor?" diye karar verilir, biri seçilir. Şimdi tasarlanmaz (var olmayan savaş modeline karşı denge kurmamak için).

## 11. Açık Noktalar (Sonra Çözülecek)

- **4-sayaç UI düzeni:** Soul + üç meta = dört sayaç. MVP'de basit tutulur (düz yan yana, placeholder); hiyerarşi/cila Faz B'de ele alınır. Karar bekleyen yapısal sorun değil.
- **Slot limiti değerleri:** Başlangıç slot sayısı ve node'larla kaç slot açıldığı placeholder; playtest ile ayarlanır.
- **Otonomi dairesi yarıçapı:** ≈ ekran-yüksekliği/10–20 placeholder (DESIGN 6.2); playtest ile ayarlanır.
- **Save uyumluluğu:** Ekonomi ve mekanik baştan değiştiği için eski save'ler uyumsuzdur. Save version bump ve temiz başlangıç gerekir. Tek oyuncu olduğundan risk düşüktür.
- **i18n lore yükü:** MVP'de 5 birim (hedef kadro sonra genişler), yaklaşık 12 düşman arketipi, kat temaları, boss banner'ları ve bestiary hem TR hem EN yazılacaktır. Mizah birebir çevrilemez, iki dil ayrı yazılır. Bu ayrı bir iş kalemidir ve kendi fazını hak eder.

## 12. Harita ve Oyun Alanı (DECISIONS K27)

### 12.1 MVP: Tek Yıkıntı-Dungeon Zemini

MVP tek bir elle-tasarlanmış harita kullanır: bir **yıkıntı dungeon**. İçinde yerlerde büyük kayalar/taşlar (engeller), bir köprü, bir meydan ve bir dar boğaz bulunur. Bu topografya serbest yerleştirmeyi (6.2) stratejik kılar: oyuncu tankı dar boğaza koyarsa tüm akışı tıkar, meydanı AoE için kullanır, menzilli birimi kaya arkasına gizler.

Çoklu harita arketibi (dar boğaz / çatal / meydan / engelli… ayrı şablonlar) + prosedürel/temalı varyant sistemi bilinçle **park'a** alındı (10): harita seçme/planlama MVP'yi şişirir ve çekirdek oynanış kanıtlanmadan erken olur. Gerekirse ileride ekstra harita/şablon eklenir.

### 12.2 Düşman Akışı (Yönel + Engelden Kaç)

Düşmanlar haritada **rastgele spawn** olur (sabit giriş yolu yok). Her düşman necromancer'a doğru **yönelir** ve önüne çıkan engelden (kaya, su/uçurum) kenarından **dolaşır** (basit steering/avoidance). Köprü gibi geçitler "yürünebilir koridor", su/uçurum "yürünemez bölge" olarak işaretlidir; düşman suya giremeyeceği için köprüye yönelmesi doğal olarak çıkar — ayrı bir "köprüyü bul" mantığı yazmaya gerek yok.

Bu bilinçli olarak **tam grid pathfinding (A\*) DEĞİLDİR.** A\* en "akıllı" çözüm ama MVP'nin en pahalı teknik kalemi olurdu ve dur-dövüşü geciktirirdi. "Hedefe yönel + engelden kaç" davranışı oyuncuya yeterince akıllı görünür, çok daha ucuzdur. (İleride gerekirse A\*'a yükseltilebilir — park.)

Hedefleme (6.1) bununla uyumlu: düşman necromancer'a yönelirken yoluna çıkan ilk birime çarpıp durur.

### 12.3 Necromancer Yerleşimi

Necromancer'ı **oyuncu yerleştirir** (kurulum fazında, diğer birimler gibi — 6.2). Büyük bir menzil (range) taşır; en arkaya konup geniş alanı tarayabilir. Kaybetme koşulu olduğu için (6.5) konumu bilinçli bir risktir: öne koyarsan daha çok vurur ama hat ihlalinde daha çabuk ölür. Necromancer da kat-arası kurulum fazında yeniden konumlanabilir.
