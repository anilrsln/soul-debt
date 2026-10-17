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

### K18 — Birim ekonomisi: Model 2
Birim *tipini açmak* → meta (bir kez). O tipten birim *örmek* → soul (her sefer). Diriltmek → soul (+ borç). Böylece "soul'u node'a mı birime mi?" kararı tek kaynaktan net doğar. Kullanıcı mantığı: "birim soul'dan yapılıyorsa, yaratırken soul harcamak tutarlı."

### K19 — Onboarding: lifetime-soul tetiği, olduğu gibi kalır
İlk kez ilk node'a yetecek lifetime soul biriktiğinde oyun bir kez durup node ekranını tanıtır. Node alıp almamak yine oyuncunun kararı; bu sadece ekranı tanıtan tek seferlik an.

### K20 — Ayrı proje (üç anlamda)
Soul Debt artık ayrı bir yapıt. Ayrı Git repo (\`soul-debt\`, temiz başlangıç — eski repo arşiv kalır), ayrı claude.ai Project, ayrı doküman seti. Eski klon dokümanları silinmez, arşiv olarak durur.

---

## Reddedilen Alternatifler (ve Neden)

### R1 — Saf idle kalmak
Kullanıcı aktif, kaybedilebilir bir oyun istedi. İdle sözleşmesi (AFK güvenli, kayıp imkansız) bu istekle çeliştiği için tür değiştirildi. İdle *özellikleri* yine de miras alındı.

### R2 — "Her 10 wave'de yeni düşman tipi"
Oyun sonsuz; sonsuz tip tasarlanamaz. 5-6 tipten sonra oyuncu yeniyi "yeni mekanik" olarak algılamayı bırakır. Yerine arketip + kat varyantı modeli (K17).

### R3 — Saf unit ölümü, manuel re-diriltme (Model C)
AFK'yi cezalandırır, idle mirasını yok eder. Yerine otomatik diriltme + üç ceza (K11). Kullanıcı da "%100 idle istemiyorum ama bu kadar da aktif değil" çizgisinde durdu.

### R4 — "Birim ölünce güçlensin"
Ceza sistemini (K11, K14) tersine çevirir: ölüm ödül olur, oyuncu birimlerini bilerek öldürür, soul-debt/cooldown/Diş-1 anlamsızlaşır. Aynı eylem hem cezalandırılıp hem ödüllendirilemez. Yerine: güç **hayatta kalmaya** bağlanır (kıdem/veteran — Yol B, park'ta).

### R5 — Birime prestige mantığı uygulamak
İç içe iki prestige = incremental tasarımında kafa karışıklığının zirvesi. Tek prestige ekseni (necromancer → tanrı → yeniden iniş) net kalsın.

### R6 — Beşinci bir kaynak ("node mu unit mi?" için ayrı meta)
Dört kaynak (soul + 3 meta) zaten var; beşincisi UI'ı ve takibi boğar. O karar zaten soul-vs-meta gerginliğinden doğuyor; Model 2 (K18) ile de "soul'u node'a mı birime mi?" tek kaynaktan net çıkıyor. Yeni kaynağa gerek yok.

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
