# Soul Debt — Karar Günlüğü

> Bu dosya, tasarım sürecinde **alınan** ve özellikle **reddedilen** kararları gerekçeleriyle kaydeder.
> Amaç: aynı tartışmaları ikinci kez açmamak. "Şunu neden yapmadık?" sorusunun cevabı burada durur.
> Oturum: 2026-10-17. Kullanıcı: Anıl.

---

## Alınan Kararlar

### K1 — EXP kaldırıldı, yerine Soul geçti
EXP eski oyunda hem harcanan para hem ilerleme ölçüsüydü. Soul bu rolü devralır ve genişletir (bkz. K12). Lifetime soul ayrı bir sayaç olarak kalır (yalnızca onboarding tetiği için).

### K2 — Level gate'i kaldırıldı
Başta "node'lar belli level'a gelmeden açılmasın" düşünüldü. Sonra level mantığı tamamen kaldırıldı: node'lar yalnızca soul (+ prerequisite node) ile açılır. Soul kısaca EXP'nin yerine geçer.

### K3 — Food kaldırıldı, yerine 3 meta geçti
Bone (yaygın → temel tipler), Essence (nadir → üst tipler), Crystal (boss → en üst tipler + prestige). Her biri ayrı stratejik eksen.

### K4 — Tür: idle değil, aktif descent-TD
Kullanıcı "%100 idle yapmak zorunda değilim" dedi. Son kararların tümü (unit ölümü, necromancer'a ulaşan hat ihlali, üç ceza, kaybedilebilirlik) aktif-TD'yi tarif ediyordu. Tür bilinçli olarak bu şekilde kilitlendi. İdle'dan miras: oto-savaş, üstel büyüme, kalıcı ilerleme, offline-idare-eder.

**Revize (K26):** Oyun saf-sonsuz DEĞİL — tanrı önceden belirli Kat N'de; ona ulaşıp yenmek oyunun hedefi/zaferi. Sonsuz döngü yerine sonlu-ama-tekrarlanabilir yapı.

### K5 — Özgünleştirme: klonun DNA'sını kırmak
Sadece asset değiştirmek "makyaj" olurdu. ZSK'nın imza mekaniklerinden ikisi bilinçli kırıldı: (1) tek yönlü koridor → dikey iniş (descent); (2) pasif kral → kaybedilebilir, canı olan necromancer + unit ölümü. Gerisi miras alındı (~%70 kod).

### K6 — Tema: bıkkın necromancer, soul-obur tanrıya iniş
Kuru, dozajlı mizah. Lore non-blocking kanallardan taşınır (boss banner, bestiary, kat kartları, idle popup). Zorunlu sinematik yok (ilk boss istisnası atlanabilir).

### K7 — Ritim: 10 wave = 1 kat
Kat içi savaş kesintisiz; kat sonu nefes/kurulum fazı (can full + dizilim değiştir + absorbe/ekle). En dip = tanrı = gönüllü prestige.

### K8 — Dur-dövüş (sızan-akış değil)
Düşman birime varınca durur, karşılıklı HP. Ön/arka saf anlamlı olur; kadroda en az 1-2 tank/blokçu zorunlu.

### K9 — Oyuncu dizer, dizilim kat aralarında değişir
Savaş içinde sabit. Oyun refleks değil planlama oyunu. Kullanıcının "stratejik düşünme isterim" çizgisinin karşılığı.

### K10 — Necromancer canı: her 10 wave full + soul ile max-can upgrade
Koşu "zamanla kaçınılmaz ölüm"e mahkûm değil; ölüm beceriden gelir. Max-can artırma soul'a bir harcama kolu daha ekler.

### K11 — Soul-debt: üç ceza birden
Anlık soul maliyeti + diriltme cooldown'u + biriken borç. Tek ceza fazla hafif, üçü birlikte anlamlı. Borç oyunun adının karşılığı ve ölüm-spiraline doğal fren.

### K12 — Soul evrensel birim (4b)
Soul birimin yapısında bir kapasite statı olarak bulunur; güçlü düşman çok soul düşürür. Sonuç: güçlü birim = pahalı diriliş = çok borç. Otomatik risk/ödül dengesi.

### K13 — Hat ihlali necromancer'a ulaşır
Düşman WALL_X'i geçerse necromancer'ın canından keser + borç bindirir. Lava mekaniği tamamen kaldırıldı (teknik borç temizliği).

### K14 — Prestige cezası: Diş 1 (zorlanmış = yarı çarpan)
Gönüllü prestige (tanrıyı yen) = tam çarpan. Zorlanmış (necromancer öl) = yarı çarpan. Ölüm cezalı ama adil; kalıcı ilerleme silinmez.

### K15 — Çarpan: Model Y (derinliğe bağlı)
Prestige ödülü ulaşılan kata bağlı. Derine inmek hem zaferde hem ölümde daha çok çarpan verir. İniş temasını ödül sistemine bağlar.

### K16 — Absorbe: kısmi-iadeli, isteğe bağlı
Kat arası bir birimi geri emmek meta'nın %50-70'ini iade eder. Tam iade reddedildi (bkz. R9).

### K17 — Düşman modeli: ~10-12 arketip + kat varyantları
Lineer tip ekleme değil; arketipleri kat temasıyla yeniden-görselleştir/güçlendir, kombinasyonla çeşitlendir.

### K18 — Birim ekonomisi: Model 3 (revize — eski Model 2 yerine)
**Önceki Model 2:** tip açmak → meta (bir kez); örmek → soul (her sefer). Bu REDDEDİLDİ (bkz. R13): tek-seferlik meta kapısı, birkaç birim açıldıktan sonra meta'yı ölü kaynağa çeviriyordu.

**Model 3 (geçerli):**
- Birim *tipini açmak* → **Conquest node'u** (soul + prerequisite node). Meta yok. Açma, ilerleme omurgasının (node ağacı) bir parçası — bkz. K21.
- O tipten birim *örmek* → **ağır soul + az o-birimin-meta'sı**, her seferinde.
- Diriltmek → soul (+ soul-debt), her seferinde.

Böylece meta'nın kalıcı bir talebi olur: essence-birimi örmeye devam ettikçe essence lazım, yani nadir düşman öldürme baskısı oyun boyu canlı kalır (K3'ün asıl niyeti). Takas: "soul'u node'a mı birime mi?" kararının tek-kaynak sadeliği (eski Model 2'nin güzelliği) feda edildi; örme artık çift kaynak (soul + meta) ister. Bilinçli: MVP'de sadelik iyiydi ama uzun vadede meta'ların ölmesi daha büyük sorun. Meta oranı: soul ağır + az meta (örme yavaş-sürekli meta tüketir, engelleyici değil).

### K19 — Onboarding: lifetime-soul tetiği, olduğu gibi kalır
İlk kez ilk node'a yetecek lifetime soul biriktiğinde oyun bir kez durup node ekranını tanıtır. Node alıp almamak yine oyuncunun kararı; bu sadece ekranı tanıtan tek seferlik an.

### K20 — Ayrı proje (üç anlamda)
Soul Debt artık ayrı bir yapıt. Ayrı Git repo (\`soul-debt\`, temiz başlangıç — eski repo arşiv kalır), ayrı claude.ai Project, ayrı doküman seti. Eski klon dokümanları silinmez, arşiv olarak durur.

### K21 — Birim açma node ağacına taşındı (tek ilerleme omurgası)
Birim *tipini açmak* ayrı bir "birim mağazası" ekranı değil, Conquest node ağacının içinde bir node. Gerekçe: (1) Bütünlük — upgrade node'ları + birim-açma node'ları tek ağaçta; oyuncunun baktığı tek ilerleme ekranı. (2) Prerequisite zinciri bedava gelir — node ağacı zaten "şu node şunu gerektirir" mantığına sahip (K2), birim teknoloji-ağacı doğal çıkar. (3) Kod mirası — ConquestManager zaten var; yeni "unit shop" sistemi yazmak yerine mevcut node tipine `unitUnlock` türü eklenir. Tek aleyhte madde (yeni birim ağaçta kaybolabilir) bir UI-vurgu meselesi, mimari sorun değil: açılan birim node'u görsel olarak öne çıkarılır. Sonuç iki temiz katman: açmak = kalıcı ilerleme (node, bir kez), örmek = koşu-içi tekrarlı harcama (soul + meta).

### K22 — MVP kadrosu: 5 birim, rol-merkezli
Çekirdek önce çalışsın: 8 yerine 5 birimle başla, eksik görülürse ekle (sonraki adaylar: Diriltici/Çürütücü destek ve Crystal-kademe elitler — park'ta). Rol-merkezli dağılım, dur-dövüşün dört ihtiyacını (blokla / tek-hedef-erit / kalabalık-biç / ayakta-tut) karşılar:

| # | Birim (çalışma adı) | Rol | Soul-kapasite | Örme meta'sı |
|---|---|---|---|---|
| 1 | İskelet Bruiser | Ön-saf hasar/blok karışımı (yarı-tank, döver) | Orta-yüksek | Bone |
| 2 | İskelet Okçu | Uzak tek-hedef DPS | Düşük | Bone |
| 3 | Hasar Büyücüsü | Alan hasarı (AoE) | Orta | Bone |
| 4 | Healer Büyücü | Destek — birim HP yenileme | Orta | Essence |
| 5 | Taş Golem | Asıl tank — taunt (çoklu-hedef ilgi çekme), aynı anda birden çok düşmanla dövüşür | Yüksek | Essence |

Rol takası (ilk taslağa göre): "tank" dediğimiz iskelet bruiser'a çevrildi (tank özelliği düşük, döver); asıl tank rolü Taş Golem'e verildi. Golem taunt'la 2-3 düşmanı tutar, arkadaki okçu/büyücü güvenle vurur — dur-dövüşte "ön saf neden önemli"nin en net cevabı. MVP meta dağılımı: 3 Bone + 2 Essence; **Crystal MVP'de kullanılmaz** (yalnız boss'tan düşer, boss sistemi geç faz). Oyuncu ilk boss'a ulaşmadan tüm MVP kadrosunu açabilir.

**Healer notu:** Healer birim-HP'sini tutar (necromancer canını değil), yani hat-ihlali cezası (K13) ve soul-debt (K11) işlemeye devam eder; healer yalnız birim ölümlerini seyreltir. Kabul edilebilir ama playtest'te "healer ölümü tümden bitiriyor mu?" diye bakılacak.

**Golem taunt notu (teknik):** Çoklu-hedef taunt, dur-dövüş kodunun en karmaşık parçası (bir birim ↔ birden çok düşman eşleşmesi, normal 1↔1 değil). Faz E'yi ağırlaştırır. MVP'de taunt basit tutulur (1 düşman tutar + çok yüksek HP); çoklu-hedef taunt çekirdek çalışınca açılır.

### K23 — Düşman teması: yeraltı yaratıkları (iskelet-çakışması çözümü)
Birimler iskelet/dirilmiş olduğundan (K22) düşmanların da "skeleton" olması hem tematik tutarsız (necromancer düşmanı öldürüp kendi ordusuna katar) hem de okunabilirlik sorunu (birim ve düşman aynı görünür, özellikle placeholder geometride). Çözüm: düşman tarafı tamamen **yeraltı yaratıkları** olur (etli/çürük, taş, ruhsal, lanetli). İskelet estetiği yalnız oyuncu ordusuna kalır. Mevcut 8 klon düşmanı mekanik olarak korunur; yalnız tema/isim ve config anahtarı yeniden yazılır (sıfır denge riski): `skeleton→ghoul`, `armored→gargoyle`, `fast→imp`, `foodCarrier→soulVessel`, `elite→cursedKnight`, `shield→warden`, `splitter→ooze`, `healer→cultist`. Kod anahtarları da temalanır (yalnız i18n ismi değil) — kodda "bu birim mi düşman mı?" karışıklığını önlemek için. Boss isimleri Faz G'de lore ile birlikte verilir. 8'in 7'si melee, cultist menzilli-destek; saf menzilli-saldırgan düşman park'a alındı (DESIGN 10): sıçrayıcı arketipiyle aynı "arka-saf baskısı" problemini çözdüğü için ikisinden biri playtest'le seçilecek, şimdi spekülatif tasarlanmayacak.

### K24 — Savaş modeli: serbest yerleşim + ankerli otonomi (lane değil)
Oyun lane/saf-dizme stratejisine bağlı DEĞİL. Birimler ızgaraya/şeride dizilmez; oyuncu her birimi serbest (x,y) noktaya yerleştirir (kurulum fazında). O nokta birimin *çıpası*. Savaşta birim çıpa merkezli küçük bir *otonomi dairesi* içinde kendi kendine hareket eder (hizalanma, boşluk kapatma, nişan, geri dönme) ama daireden çıkmaz. Yarıçap placeholder'ı ≈ ekran-yüksekliği/10–20 (playtest). Gerekçe: oyuncu "birimler arka arkaya dizilsin" istemiyor; otonomi savaşı canlı kılar ama çıpa oyuncunun yerleşimini belirleyici tutar.
- **Hedefleme:** düşman necromancer'a ilerler, *yoluna çıkan ilk birime* çarpar (en yakına değil). Konumlama gerçek karar; tankı yola koymazsan sızarlar.
- **Birim limiti:** slot-tabanlı (kaç birim, node'larla açılır); konum serbest ama sayı sınırlı — soul sonsuz birim basmayı önler, dizilim planlamasını (K9) anlamlı tutar.
- **Yerleşme animasyonu:** birim çıpaya ışınlanmaz, yürüyerek gider (oyuncunun "kendiliğinden pozisyon alma" isteği).
- **K9 revizesi:** "dizilim savaşta tamamen sabit" → "çıpa sabit + daire-içi otonom". Planlama oyunu kimliği korunur (oyuncu çıpa konumlar), savaş-içi mikro-hareket otonomiye bırakılır.
- **Faz sırası:** Faz E'de önce çıpa-sabit (hareketsiz) dur-dövüş; ankerli otonomi cila katmanı olarak üstüne eklenir (çekirdek bağımlılığı değil).

### K25 — Necromancer bir birim: başlangıç silahı + yönlendirilebilir hedef
Necromancer yalnız can havuzu (K10) değil, aynı zamanda oyunun başlangıç birimidir ve damage verir. Klon kökenindeki ilk birim `laser` (sabit, menzilli, upgrade'lenen başlangıç kulesi) rolü necromancer'a taşınır; hiring yok, hep sahnede. Sabit konumlu + menzilli olduğundan arkada güvende durup öne gelen düşmana vurur — çift rol (damage + kaybetme koşulu) çelişmez: düşman hattı aşıp ona ulaşırsa canından yer (son savunma hattı). Lore: bıkkın necromancer ordusunu öne sürer, köşeye sıkışınca isteksizce kendi vurur.
- **Hedefleme:** varsayılan en yakın düşman (otomatik — idle sözleşmesi). Oyuncu bir düşmanı tıklarsa **yapışkan hedef**: o ölene/menzilden çıkana kadar necromancer onu vurur, sonra otomatiğe döner. Alan-koruması stratejisini "şu tehlikeliyi öncelikle temizle" komutuyla destekler. Ara sıra komutan-dokunuşu; sürekli mikro değil (K4/K9 korunur).
- **Kapsam:** yalnız necromancer yönlendirilir; diğer menzilli birimler (okçu/büyücü) otomatik. Hepsini yönlendirmek mikro-yönetim kaosu olurdu (park).
- **Aktif yetenekler (MVP değil):** node'dan açılan, soul maliyetli + cooldown'lu, ara sıra kullanılan yetenekler (lanetle/yavaşlat/ruh patlaması) ileride eklenir. Çekirdek çalışınca; yeni input/cooldown/hedef sistemleri çekirdekten önce yük olmasın. Necromancer'ın temel damage hali MVP'ye girer.
- **UX:** tıklanan düşmanda görsel hedef işareti (Faz C/D).

### K26 — Oyun sonlu: tanrı Kat N'de, zafer + opsiyonel devam
Oyun saf-sonsuz tasarlanmaz (K4 revize). Tanrı önceden belirli bir Kat N'de (placeholder; playtest — ör. Kat 10 ≈ 100 dalga). Tanrıyı yenmek oyunun hedefi ve **zaferi**: zafer ekranı → oyuncuya "tekrar oyna" ve "endless devam" seçeneği. Gerekçe: sonsuz oyun dengelenemez/test edilemez; sonlu oyun oynanıp bitirilebilir. Prestige iki bağlamda gelir: zafer (gönüllü, tam çarpan) veya ölüm (zorlanmış, yarı — K14). Endless mod + New Game+ döngüsü park'ta (DESIGN 10); MVP yalnız zafer + tekrar/endless seçeneği sunar.

### K27 — Harita: tek yıkıntı-dungeon + yönel-kaç akışı + oyuncu-yerleştirmeli necromancer
- **MVP tek elle-tasarlanmış harita:** yıkıntı dungeon — kayalar/taşlar (engel), köprü, meydan, dar boğaz. Topografya serbest yerleştirmeyi (K24) stratejik kılar (tankı boğaza koy, meydanı AoE'ye kullan, menzilliyi kaya arkasına gizle). Çoklu harita arketibi + prosedürel şablon park'ta (DESIGN 10) — harita planlama MVP'yi şişirir, çekirdek kanıtlanmadan erken.
- **Düşman akışı:** random spawn → necromancer'a yönel + engelden kaç (basit steering/avoidance). Köprü=yürünebilir, su/uçurum=yürünemez → köprüye yönelme doğal çıkar (ayrı "köprü bul" mantığı yok). Tam A* grid pathfinding bilinçle reddedildi (MVP'nin en pahalı kalemi, dur-dövüşü geciktirir); "yönel+kaç" yeterince akıllı görünür. A* park'ta.
- **Necromancer yerleşimi:** oyuncu yerleştirir (kurulum fazında, diğer birimler gibi — K24), büyük range. En arkaya konup alanı tarar; kaybetme koşulu olduğundan (K25/6.5) konum bilinçli risk. Kat-arası fazda yeniden konumlanabilir.

### K28 — Savaşta örme/yerleştirme açık ama opsiyonel (idle + aktif derinlik)
Soru: wave (savaş) içinde yeni birim örülebilir mi, ve örülürse konumunu oyuncu mu verir? Gerilim: tam serbestlik stratejik derinlik verir ama refleks oyununa kaydırır (idle'dan uzaklaşır); tam kapalı idle/planlamayı korur ama savaşı durağanlaştırır, derinliği öldürür. Çözüm iki ekseni ayırmak:
- **Örme (ekonomik):** savaşta her zaman açık — soul birikir, ordu büyür (idle mirası K4'ün kalbi).
- **Yerleştirme (stratejik):** savaşta da serbest AMA **opsiyonel**. Oyuncu örüp istediği yere koyabilir (acil müdahale) ama dokunmazsa mevcut ordu + necromancer idle olarak hattı tutar. Refleks oyunu müdahaleyi *zorunlu* kılar; Soul Debt *ödüllü* kılar (tıklarsan daha iyi, tıklamazsan idare). İdle sözleşmesi korunur, üstüne opsiyonel aktif derinlik eklenir.
- **Kapsam:** yeni örülen/konumlanan birimler savaşta yerleştirilir; mevcut birimler savaşta çıpalarında kalır (ankerli otonomi dairesi dışına taşınmaz). İnce dizilim + absorbe kat-arası fazda; savaş yerleştirmesi "kaba/acil", kat-arası "ince ayar".
- **K9/K24 ilişkisi:** K9'un "savaşta tamamen sabit dizilim" kuralı bir kez daha yumuşadı. Asıl amaç ("panik zorunlu olmasın") korunur; panik hâlâ opsiyonel. (Mevcut birimleri de savaşta taşıma seçeneği reddedildi — mikro-yönetim/refleks riski en yüksek oydu.)

### K29 — Diriltme: oto-taban + opsiyonel manuel öncelik; absorbe soul+meta; kat-sonu can tazeleme
Dört kenar-durumu tek kararda toplandı (K28 tartışmasından türedi):
- **Diriltme modeli:** Oto-diriltme varsayılan kalır (AFK güvenli; saf-manuel = R3 reddi korunur). Üstüne **opsiyonel manuel öncelik**: oyuncu kuyruğa müdahale eder (önce şunu dirilt / şunu ertele). Zorunlu değil — dokunmazsan sistem sırayla diriltir. İdle taban + aktif derinlik (K28 felsefesi). İleride bir node'dan açılabilir (K21). Saf-manuel diriltme (Model C) bilinçle reddedildi — AFK'de ordu çöker, idle (K4) ölür.
- **Diriltme vs örme sırası:** FIFO — hangisi önce aktive edildiyse o. Pooling'i bozmaz (ikisi de havuzdan çeker, sıra sadece öncelik).
- **Absorbe iadesi:** örme hem soul hem meta harcadığından (Model 3), absorbe **ikisini de** kısmen iade eder (%50-70 placeholder). Diriltme yalnız soul harcar, meta değil.
- **Kat sonu:** tüm birimler can yeniler + necromancer full. Ama diriltme kuyruğu + soul-debt DEVAM eder (borç affı yok; K11 cezası korunur). Kat sonu nefes anı, af değil.
- **Necromancer ölümü (teyit):** Kat 1'e dönüş + tüm koşu-içi reset (upgrade'ler + birimler dahil) + prestige çarpanı kalıcı (K14/K25). Yeni karar değil, kesişim teyidi.

### K30 — Birim örme maliyeti: serbest çok-metalı (tek-meta varsayımı kalktı)
K22'deki örtük "her birim tek meta ile örülür" varsayımı kaldırıldı. Bir birimin örme maliyeti **soul + herhangi bir meta kombinasyonu** olabilir — iki, hatta üçten fazla meta dahil. Örnekler (placeholder, playtest'te değişir):
- İskelet Bruiser: soul + bone
- İskelet Okçu: soul + bone
- Hasar Büyücüsü: soul + bone + essence
- Healer Büyücü: soul + bone + essence
- Taş Golem: soul + essence

Gerekçe: çok-metalı maliyet daha zengin build baskısı yaratır ("bu birimi örmek için hem bone hem essence biriktirmeliyim"). Config yapısı buna göre serbesttir: her birime `craftCost: { soul: N, bone?: M, essence?: K, crystal?: L }` — yalnız gereken metalar yazılır. Diriltme hâlâ YALNIZ soul (K29); çok-meta yalnız örmede. Kesin değerler ve hangi birimin hangi metaları isteyeceği playtest'te ayarlanır — bu yüzden MVP'ye placeholder olarak girer.

### K30 — Birim örme maliyeti: serbest çoklu-meta
Bir birim örme maliyeti soul + **herhangi sayıda meta** olabilir (tek meta zorunlu değil — önceki K22 "tek-meta" varsayımı kaldırıldı). Örnekler: İskelet Bruiser/Okçu = soul + bone; Taş Golem = soul + essence; Hasar Büyücüsü ve Healer Büyücü = soul + bone + essence (iki meta). Gerekçe: çoklu-meta "bu birimi örmek için hem bone hem essence biriktirmeliyim" build baskısı yaratır — K3'ün stratejik eksen fikrini güçlendirir. Config yapısı: her birimde `craftCost: { soul, bone?, essence?, crystal? }` (hangisi varsa). Değerler ve meta kombinasyonları placeholder; playtest'te değişir (MVP başlangıç önerisi: 3 bone-ağırlıklı + 2 essence-ağırlıklı birim, iki büyücü bone+essence karması). Diriltme hâlâ YALNIZ soul (K29); meta yalnız örmede.


### K31 — Yabancı klon sistemleri temizliği: combo kaldırıldı, milestone kaldırıldı
Klon kökünden miras kalan iki sistem Soul Debt kurgusuna aykırı bulunup söküldü (kod işi, 2026-10-17):
- **ComboManager (kill-streak ödül çarpanı) — KALDIRILDI.** Combo bir *refleks/akış* ödülüydü ("pencere kapanmadan art arda öldür, çarpanı büyüt"). Soul Debt kimliği planlama + dur-dövüş + idle-güvenli (K4/K9). Dur-dövüşte (düşman birime çarpıp durur) öldürmeler düzensiz aralığa yayılır, 2.5sn combo penceresi çoğu zaman boş döner — mekanik zaten anlamını yitiriyordu. Daha önemlisi: soul evrensel kaynak (K12) ve diriltme maliyeti ona bağlı; combo soul'u şişirince K12'nin risk/ödül matematiği bozuluyordu. `ComboManager.js` silindi; Enemy ekonomi çarpanından `comboMult` çıkarıldı; GameScene/UIScene/config/i18n/main referansları temizlendi.
- **MILESTONE (her 25/50/100 wave'de soul/meta bonusu) — KALDIRILDI.** "Her N wave" = sonsuz-wave varsayımı; K26 oyunu sonlu yaptı (10 wave = 1 kat, tanrı Kat N'de). Milestone kat ritmini (K7) yok sayıp paralel bir ödül takvimi işletiyordu; ayrıca "60 saniyelik gelir bonusu" pasif-gelir mantığı (Soul Debt'te gelir öldürmeden gelir). Ödül yeri = kat-sonu (K7: can full + kurulum fazı). config MILESTONE + milestone/bigMilestone SFX, WaveManager bloğu, UIScene toast + event kaldırıldı.

### K32 — Crit PARK, Achievements içeriği Faz G'ye ertelendi
- **Kritik vuruş (crit) — PARK EDİLDİ (kaldırılmadı).** Combo'nun aksine crit ekonomiye dokunmaz (yalnız archer/cannon mermilerinde hasar varyansı). Dur-dövüş savaş modeli (Faz E) oturmadan silmek erken/gereksiz iş olurdu. config `COMBAT.crit` ve ilgili kod (Defender.rollDamage, Projectile.isCrit, Enemy._critFlash, GameScene.onCritHit) çalışır halde bırakıldı; Faz E'de yeni savaş modeline göre tutulacak veya değiştirilecek.
- **ACHIEVEMENTS — SİSTEM TUTULDU, içerik Faz G'ye ertelendi.** AchievementManager + UI sağlam ve ölü değil. Ama içerik eski kurguya bağlı: `wave50/wave100` sonsuz-wave varsayımı (K26 ile çelişir), `cannonUnlock/archerFull` eski kadroya (K22'de değişecek) bağlı. Şimdi silinmedi/yeniden yazılmadı — Faz G'de kadro + kat + soul-debt kurgusu oturunca Soul Debt'e özgü başarımlarla (necromancer ölümü, ilk tanrı, N. kat, soul-debt zirvesi vb.) doldurulacak.


### K33 — Soul-debt modeli: ayrı sayaç, koşu-içi; hat ihlali borç yazmaz
Soul-debt'in oyuncuya tam olarak ne yaptığı netleştirildi (Faz D tasarımı, 2026-10-17):
- **Soul ve soul-debt İKİ AYRI sayaçtır.** Soul = kaynak (düşman öldürünce kazanılır, her şey
  onunla alınır). Soul-debt = ceza sayacı (soul'dan DÜŞMEZ; ayrı birikir). Diriltme iki şey yapar
  aynı anda: (a) soul harcar [cepten], (b) borç yükler [sırta]. Borç bir "ikinci para" değil.
- **Borç ne işe yarar (K11 üçüncü ceza):** Borç yükseldikçe sonraki diriltmeleri pahalılaştırır:
  `diriltme_maliyeti = taban × (1 + debt / debtÖlçek)`. Tek yöne odaklı ceza — üç ceza da
  (anlık soul + cooldown + borç çarpanı) diriltme etrafında toplanır, okunur kalır. Alternatif
  "borç soul kazanımını yavaşlatsın" REDDEDİLDİ (bkz. R14): dolaylı + ekonomi zaten kill'e bağlı,
  çifte ceza hissi.
- **Borç nasıl birikir/azalır:** Birikir = YALNIZ diriltme (güçlü/kapasiteli birim = daha çok borç,
  K12). Azalır = zamanla pasif erime + her düşman kill'inde biraz silinir ("ruh hasat ederek borç öde").
- **Hat ihlali borç YAZMAZ (DESIGN 6.5 revize):** Düşman necromancer'a ulaşınca yalnız CAN keser
  (Faz C), borç bindirmez. Gerekçe: hat ihlali zaten bir ceza (cana); üstüne borç = çifte ceza +
  bulanık mekanik. İki ceza ekseni net ayrışır: borç = BİRİM kaybının sonucu (diriltme baskısı);
  can = HAT kaybının sonucu (kaybetme koşuluna yaklaşma). (DESIGN 6.5'teki "+ borç" ibaresi iptal.)
- **Borç koşu-içidir (A):** Prestige'de (necromancer ölümü dahil) borç sıfırlanır — tam reset
  kuralına uyar (çarpan + açılmış tipler hariç her şey sıfır). Necromancer ölümü ayrıca borç
  BİNDİRMEZ (çünkü hemen reset olacak; bindirmek anlamsız). Borç yalnız koşu İÇİNDE baskı yapar.
- **Faz F notu (park değil, açık kapı):** "Borç prestige'i AŞSIN (kalıcı), necromancer ölümü ekstra
  borç bindirsin, yeni koşu borçla başlasın" fikri (Model B) tematik olarak güçlü ama yeni koşuyu
  boğma riski var; playtest etmeden kalıcı yapılmaz. Faz F (prestige) yazılırken değerlendirilecek.


### K34 — Melee = tıkaç (+ lunge cilası); ranged = sabit; kiting yok
Faz E savaş modeli netleştirildi. Sorun: K24'ün "ankerli otonomi dairesi" melee için
çalışmıyordu — çıpaya bağlı melee, dairesi dışından geçen düşmana ulaşamayıp "anlamsızca el
pençe bekliyor" (görsel olarak ölü). Çözüm, melee ve ranged'i AYNI kalıba sokmayı bırakmak:
- **Melee = TIKAÇ (blocker), avcı değil.** Dur-dövüş (K8) zaten "düşman birime çarpınca durur"
  diyor — yani düşman melee'ye GELİR, melee peşinden koşmaz. Melee yolun üstündeyse iş görür;
  değilse o düşman onun derdi değil (arkadaki ranged/necromancer halleder). Oyuncunun işi melee'yi
  düşmanın geçeceği yere koymaktır (K24: "tankı yola koymazsan sızarlar") — yanlış koymak strateji
  hatası, mekanik kusur değil. Melee çıpada "nöbet" idle'ı oynar (el pençe değil; doğru animasyonla canlı).
- **Lunge cilası (çekirdek sonrası):** Melee'ye küçük bir `lungeRadius` — tam yanından/dibinden
  geçmeye çalışan düşmanı kısa mesafede yakalar (intercept), sonra çıpasına döner. "Dibimden geçti
  ama kılıç kalkmadı" boşluğunu kapatır. Çekirdek bağımlılığı değil; önce tıkaç çalışır, lunge eklenir.
- **Ranged = SABİT, kiting YOK.** Okçu/büyücü çıpada durur, menzilindekini vurur. Geri-çekilme/vur-kaç
  (kiting) EKLENMEDİ: mikro-yönetim + refleks ister, K4/K9 (planlama, idle-güvenli) kimliğinin tam
  karşıtı. Ranged'in korunması oyuncunun dizilim işidir (önüne tank koy), refleksle değil.
- **İlişki:** K24'ün otonomi dairesi fikri ranged için zaten mantıklıydı (menzile hizalanma);
  melee için "daire" yerine "tıkaç + lunge" modeli geçerli. K8 dur-dövüş korunur.


### K35 — Necromancer hedef kilidi + acil-tehdit istisnası
Sorun (playtest gözlemi): Necromancer her frame menzildeki EN YAKIN düşmanı yeniden seçiyordu →
hedef zıplaması (target flickering). Az canlı bir hedefi bırakıp daha yakın/tam canlı bir düşmana
geçiyor, DPS birden çok yarı-canlı düşmana saçılıyor, hiçbiri temizlenmiyordu — yarı-canlı düşmanlar
birikip hatta ilerliyor, necromancer hasar yiyordu. En-yakın + her-frame-yeniden-seçim kombinasyonu
hatalıydı (kalan can hiç hesaba katılmıyordu).

**Çözüm — hedef kilidi + acil-tehdit istisnası (öncelik sırası):**
1. **Yapışkan hedef (K25):** oyuncu bir düşmanı tıkladıysa her şeyin üstünde — o öncelikli.
2. **Acil tehdit:** necromancer'a kritik yakın (`emergencyThreatDist`, placeholder 70px) bir düşman
   belirirse kilit KIRILIR, ona geçer. Lore: bıkkın necromancer geride durmak ister ama dibine
   dayanan tehdide "can havliyle" isteksizce el atar (son savunma refleksi — K25'in "köşeye
   sıkışınca kendi vurur" temasıyla birebir). Mekaniği açıklanabilir kılar, kusur gibi görünmez.
3. **Kilitli otomatik hedef:** seçtiği hedefi ÖLENE veya menzilden çıkana kadar vurur — her frame
   zıplamaz. Overkill/DPS saçılması biter, düşmanlar tek tek temizlenir.
4. **Yeni kilit:** kilit boşaldığında menzildeki en yakını seçer.

Kapsam: şimdilik yalnız necromancer. Diğer ranged birimler (okçu/büyücü) aynı zıplama sorununu
yaşayabilir — Faz G kadro gelince aynı kilit mantığı base Defender.findTarget'a taşınabilir
(şimdilik spekülatif değil; necromancer'da kanıtlandıktan sonra). "En az canlıyı bitir" politikası
alternatifi değerlendirildi ama kilit + en-yakın yeterli ve daha okunur bulundu.

---

## Reddedilen Alternatifler (ve Neden)

### R1 — Saf idle kalmak
Kullanıcı aktif, kaybedilebilir bir oyun istedi. İdle sözleşmesi (AFK güvenli, kayıp imkansız) bu istekle çeliştiği için tür değiştirildi. İdle *özellikleri* yine de miras alındı.

### R2 — "Her 10 wave'de yeni düşman tipi"
Oyun sonlu ama uzundur (Kat N'e kadar çok kat; K26); yine de her kata elle yeni tip tasarlamak sürdürülemez. 5-6 tipten sonra oyuncu yeniyi "yeni mekanik" olarak algılamayı bırakır. Yerine arketip + kat varyantı modeli (K17).

### R3 — Saf unit ölümü, manuel re-diriltme (Model C)
AFK'yi cezalandırır, idle mirasını yok eder. Yerine otomatik diriltme + üç ceza (K11). Kullanıcı da "%100 idle istemiyorum ama bu kadar da aktif değil" çizgisinde durdu.

### R4 — "Birim ölünce güçlensin"
Ceza sistemini (K11, K14) tersine çevirir: ölüm ödül olur, oyuncu birimlerini bilerek öldürür, soul-debt/cooldown/Diş-1 anlamsızlaşır. Aynı eylem hem cezalandırılıp hem ödüllendirilemez. Yerine: güç **hayatta kalmaya** bağlanır (kıdem/veteran — Yol B, park'ta).

### R5 — Birime prestige mantığı uygulamak
İç içe iki prestige = incremental tasarımında kafa karışıklığının zirvesi. Tek prestige ekseni (necromancer → tanrı → yeniden iniş) net kalsın.

### R6 — Beşinci bir kaynak ("node mu unit mi?" için ayrı meta)
Dört kaynak (soul + 3 meta) zaten var; beşincisi UI'ı ve takibi boğar. O karar zaten soul-vs-meta gerginliğinden doğuyor; Model 3 (K18) birim örmeyi soul + o birimin meta'sına bağlar; "soul'u node'a mı birime mi?" kararı yine bu iki mevcut kaynaktan çıkar. Beşinci kaynağa gerek yok.

### R7 — Diş 0 (gönüllü = zorlanmış prestige aynı ödül)
Ölmeyi kısayola çevirir; oyuncu tanrıya inmek yerine bilerek ölür. Oyunun hedefini sabote eder. Diş 1 seçildi (K14).

### R8 — Model X (sabit prestige çarpanı)
Kat 2'de ölmek ile Kat 9'da ölmek aynı ödülü verir; derine inme motivasyonunu öldürür. Model Y seçildi (K15).

### R9 — Tam-iadeli / otomatik absorbe
Her kat başında bedelsiz yeniden kurulum yaratır; meta ekonomisini ve dizilim planlamasını (K9) anlamsızlaştırır. Kısmi-iadeli, isteğe bağlı absorbe seçildi (K16).

### R10 — Oto-dizilim (sistem yerleştirir)
"Stratejik düşünme isterim" çizgisini öldürür. Oyuncu-dizilimli kurulum seçildi (K9).

### R11 — Necromancer canı için oto-tamir node (şimdilik)
Ölümü fazla yumuşatıp cezaları (K11, K14) anlamsızlaştırma riski. v2'ye park edildi; önce ölümün nasıl hissettiği playtest edilecek.

### R12 — Zorunlu boss sinematiği
İdle/akış sözleşmesini bozar, oyuncuyu sinirlendirir. Non-blocking banner + opsiyonel bestiary seçildi (K6). Tek istisna: atlanabilir ilk-boss tanıtımı.

### R13 — Tek-seferlik meta kapısı (eski Model 2)
"Birim tipini açmak için meta harca (bir kez), sonra örmek yalnız soul" modeli reddedildi. Sorun: meta tek-seferlik bir eşiğe iner; birkaç birim açıldıktan sonra bone/essence çöp olur ve "bone ordusu mu essence elitleri mi?" build kararı (K3'ün ruhu) buharlaşır. Yerine Model 3 (K18): meta örmede sürekli harcanır, kalıcı talep kazanır. Açma işi ise node'a taşındı (K21), meta'dan arındı.

### R14 — Borç soul kazanımını yavaşlatsın (üçüncü ceza alternatifi)
Soul-debt'in üçüncü cezası olarak "borç yükseldikçe soul kazanım oranı düşsün" reddedildi (K33).
Sorun: (a) dolaylı — oyuncu neden yavaşladığını anlamaz; (b) ekonomi zaten düşman-kill'e bağlı,
ölünce zaten az kill olur → çifte ceza hissi. Yerine borç yalnız diriltme maliyetini çarpar
(doğrudan, okunur). "İkisi birden" (hem kazanım yavaşlat hem diriltme pahalandır) da playtest'te
aşırı sert bulunacağı için MVP'ye alınmadı.
