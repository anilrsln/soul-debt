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
