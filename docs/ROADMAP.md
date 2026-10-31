# Soul Debt — Yol Haritası

> Faz sırası `MIGRATION.md`'deki teknik geçiş planıyla hizalıdır.
> Her faz çalışır bir ara durum bırakır; büyük patlama yerine kademeli ilerleme.
> Denge değerleri baştan sona placeholder — playtest ile iteratif ayarlanır.

## Durum: Geçiş Başlangıcı

Çalışan bir klon MVP tabanı var (Idle Kingdom Defense). Soul Debt'e evrim başlıyor.

| Faz | Açıklama | Durum |
|-----|----------|-------|
| 0 | Repo kurulumu (soul-debt, temiz başlangıç, Pages) | 🟡 kısmen (kopya + ilk commit tamam; GitHub repo + push + Pages kullanıcıda) |
| A | Lava mekaniğini tamamen sök | ✅ |
| B | Ekonomi: EXP→Soul, Food→3 meta, Model 3, 4-sayaç UI | ✅ |
| C | Necromancer varlığı + canı + hat ihlali (breachLine) | ✅ |
| D | Soul-debt sistemi + otomatik diriltme (üç ceza) | ✅ (birim-ölümü tetiği Faz E'de bağlandı) |
| E | Dur-dövüş + oyuncu dizilimi + kat-arası kurulum fazı | 🟡 çekirdek kuruldu (kat-arası tam-duraklama fazı + harita engel-çarpışması cila) |
| F | Prestige: iki yol (gönüllü/zorlanmış), Model Y çarpan | ✅ |
| G | Ritim (kat döngüsü) + kadro (7 birim + veteran) + düşman kimliği + lore | 🟡 kadro+düşman+kat döngüsü TAMAM; lore kaldı |
| I | Kontrol sistemi (sol/sağ tık komut) + deploy fazı + conquest-gate | 🟡 çekirdek TAMAM; sürükle-bırak (deploy Parça 4) kaldı |
| H | Save version bump + denge + playtest cila | ⬜ (asıl bitiş çizgisi) |

## Faz Detayları

### Faz 0 — Repo Kurulumu
- [x] `soul-debt` klasörü, MVP'den temiz-kopya (node_modules/dist/.git/timestamp hariç)
- [x] package.json / package-lock / index.html başlık / README → Soul Debt kimliği
- [x] Tasarım dokümanları docs/ altına
- [x] Taze git init + ilk commit
- [ ] GitHub'da `soul-debt` reposu + push (kullanıcı, SSH)
- [ ] GitHub Pages: Settings → Pages → GitHub Actions

### Faz A — Lava Temizliği
- [ ] `dieToLava`, `drawLava`, `getLavaExpRate`, `CONFIG.LAVA_X`, `lavaConversion` sil
- [ ] `dieToWall` → `breachLine` iskeletine çevir (geçici: ödülsüz ölüm)
- [ ] Oyun hâlâ çalışır durumda

### Faz B — Ekonomi
- [x] GameState: soul + bone/essence/crystal + lifetimeSoul
- [x] EconomyManager: soul kazanım/harcama, meta drop'ları, Model 3 hire (soul + çok-meta, K30)
- [x] UpgradeManager + ConquestManager: maliyet → soul (node'lar soul)
- [x] UI: 4 sayaç (soul 👻 + bone 🦴 + essence 🔮 + crystal 💎)
- [x] Onboarding: ilk lifetime-soul eşiğinde node ekranını bir kez tanıt

### Faz C — Necromancer ✅
- [x] Sahnede konumlu, can havuzlu necromancer (eski LaserMonument → Necromancer; K25 seçenek A)
- [x] breachLine → necromancer canından sabit `breachDamage` kesinti (K13)
- [x] Her 10 wave (kat sonu) full dolum; soul ile maxHp upgrade kolu (K10)
- [x] Yönlendirilebilir hedefleme: düşmana tık → yapışkan hedef (K25)
- [x] Can 0 → tam dur + "öldün" ekranı (placeholder; prestige bağlama Faz F)
- [x] GameState.necromancer + SaveManager v7 migration
- Not: soul-debt breachLine'a BURADA bağlanmadı — o Faz D (K11). Can anahtarı/sprite 'laser'
  tarihsel; K23 ile Faz G'de temizlenir. Necromancer düşmanla bire bir DÖVÜŞMEZ (can havuzu).

### Faz D — Soul-Debt ✅
- [x] SoulDebtManager: ayrı borç sayacı (soul'dan düşmez — K33), üç ceza (soul + cooldown + borç çarpanı)
- [x] Otomatik diriltme kuyruğu (FIFO, AFK güvenli — K29); `onUnitDeath`/`update`/`revive` API
- [x] Diriltme maliyeti = soulCapacity × katsayı × (1 + borç/ölçek) — K12; config'de tüm sabitler
- [x] Borç azalır: zamanla (debtDecayPerSecond) + her kill'de (debtDecayPerKill — "ruh hasat")
- [x] DEFENDERS'a soulCapacity alanları (placeholder; gerçek kadro Faz G)
- [x] GameState.soulDebt + SaveManager v8; UI borç göstergesi (borç>0'da görünür)
- [x] **Birim ölümü → diriltme TETİĞİ BAĞLANDI (Faz E):** Defender.die() → SoulDebtManager.onUnitDeath;
      cooldown + soul sonrası Defender.revive() birimi çıpasında kaldırır. Uçtan uca test edildi.
- Not: Düşman-orantılı breach hasarı (K12) — Faz C'de breach SABİT kaldı (`NECROMANCER.breachDamage`).
      K33 kararıyla hat ihlali borç YAZMAZ (yalnız can). Orantılı breach HASARI hâlâ açık kalem:
      düşman gücüne göre can-kesintisi ölçeklensin mi? Faz E/denge sırasında playtest ile değerlendir.

### Faz E — Savaş Modeli 🟡
- [x] Dur-dövüş: düşman yoluna çıkan ilk MELEE tıkaça çarpar + durur, karşılıklı HP (K8/K34)
- [x] Melee = tıkaç + lunge (lungeRadius ile yakalama, çıpaya dönüş); ranged = sabit, kiting yok (K34)
- [x] Birim HP'si + ölüm → SoulDebtManager.onUnitDeath → diriltme (Faz D tetiği BAĞLANDI)
- [x] Lane SÖKÜLDÜ: drawLanes/syncDefenders lane matematiği kaldırıldı; random Y spawn (K27)
- [x] Serbest (x,y) yerleştirme: birime tık→seç, boş yere tık→çıpa taşı (K24); necromancer hedefiyle çakışmaz
- [x] Birim HP barları + seçim halkası + unitDeath ölüm efekti
- [x] cannon → MELEE blokçu (mevcut kadroda gerçek tank yoktu; Golem gelince Faz G'de devralır)
- [x] **Kat-arası tam-duraklama kurulum fazı (K28):** TAMAM (Faz G içinde). Kat sonu savaş durur,
      "İN" ile devam + geçiş kartı. (absorbe cilası hâlâ açık/park.)
- [ ] **Harita engel-ÇARPIŞMASI:** drawObstacles şu an yalnız görsel doku. Gerçek engel/köprü/dar-boğaz
      + düşman steering (engelden kaç) sonraki iterasyon (K27). A* park'ta kalır.
- [ ] **Ankerli otonomi cilası (ranged):** ranged birimler çıpada tam sabit; menzile hizalanma
      otonomisi (K24 daire) henüz yok — cila katmanı, çekirdek bağımlılığı değil (DESIGN 6.2).
- Not: config.LANE_COUNT ÖLÜ sabitti — Faz G Aşama 5'te SİLİNDİ.

### Faz F — Prestige ✅
- [x] İki yol: voluntaryPrestige (tanrıyı yen → tam) + forcedPrestige (necromancer öl → yarı, Diş-1 K14)
- [x] Model Y çarpan: kalıcı kazanç = base + ulaşılan_kat × perFloor (derinliğe bağlı — K15). Test edildi.
- [x] Kalıcı: çarpan BİRİKİR + açılmış birim TİPLERİ korunur; soul/meta/upgrade/adet/kat/soul-debt sıfırlanır
- [x] Kat kavramı: waveToFloor (10 wave = 1 kat, K7); config.PRESTIGE.godFloor = Kat N (placeholder 4)
- [x] Tanrı Kat N'in son dalgasında spawn (WaveManager.isGodWave); normal boss'tan godHpMultiplier kat güçlü
- [x] Tanrı yenilince god-defeated → ZAFER ekranı (K26); necromancer ölünce → ölüm ekranı; ikisi de
      _showRunEndScreen (kazanılan çarpan + "Yeniden İn"/"Yeniden Başla")
- [x] UI: kat göstergesi (D{wave} · Kat {floor}/{god}); manuel prestige butonu KALDIRILDI (K26 — keyfi değil)
- Not: Endless/New Game+ döngüsü park'ta (K26/DESIGN 10) — MVP yalnız zafer + yeniden-in.
      config.prestigeUnlock node'u + prestige.unlocked ÖLÜYDÜ (otomatik tetik) — Faz G Aşama 5'te SİLİNDİ.
      Tanrı için özel 'god' asset/stat yok; geçici boss_armored kullanılıyor — Faz G.

### Faz G — Ritim + Kadro + Lore 🟡
Kadro + düşman refactoru TAMAM + push edildi (2026-10-18):
- [x] Veri-odaklı defender mimarisi: tek Defender sınıfı + registry (Aşama 1)
- [x] Rename: necromancer/golem/mage/bruiser/archer + i18n + mermi/ses (Aşama 2, K22/K23)
- [x] bruiser gerçek melee ön-saf + melee temizliği + diriltme statı korur (Aşama 3)
- [x] **Veteran (kıdem) sistemi (K37):** VeteranManager — soul-bazlı eşit dağıtım, üstel eşik,
      veteranBonus{damage,hp,special}; diriltme korur / iptal sıfırlar + "✕ bırak" göstergesi.
- [x] **Cleric (healer birim, Aşama 4):** combatType 'support' — menzildeki en yaralı dostu
      iyileştirir; clericUnlock conquest node; heal gücü kıdem special çarpanına bağlı.
- [x] **SaveManager v9 + ölü kod temizliği (Aşama 5):** v8→v9 eski defender anahtarlarını map+sil
      (tip kilidi taşınır, adet/level temiz-başlar); PerkManager/LANE_COUNT/prestigeUnlock node/
      prestige.unlocked kaldırıldı.
- [x] **Düşman kimliği (K23):** ghoul/gargoyle/imp/soulVessel/cursedKnight/warden/ooze/cultist
      (healer→cultist, oyuncu cleric çakışması çözüldü); config/asset/weights/typeUnlocks/i18n.

Faz G içerik işleri (2026-10-18/23 arası TAMAMLANANLAR):
- [x] **Kat-arası tam-duraklama fazı (K28):** kat sonu (10. wave, boss sonrası) savaş durur,
      oyuncu dizer/örer/ölüleri gözden geçirir, "⬇ İN" ile devam. god wave hariç. WaveManager
      isFloorBreak + GameScene _onFloorBreak banner.
- [x] **Kat geçiş kartı (placeholder):** "İN" sonrası kısa "KAT N" perdesi (fade). _onFloorResumed.
- [x] **Achievements yeniden yazımı:** kırık i18n anahtarı (cannonUnlock→golemUnlock) düzeltildi;
      3 yeni (veteran5/firstCancel/floor3) + besleyen stat sayaçları.
- [x] **Çok-durumlu animasyon altyapısı:** AssetProvider key başına states{idle,walk,attack,hurt,
      death}; tek sheet ardışık frame blokları; geriye-uyumlu (eski idle-only otomatik). Defender +
      Enemy durum geçişleri (walk/attack/hurt/death). Frame sayısı+boyut config-driven.
- [x] **5 karakter sprite'ı bağlandı (placeholder asset):** necromancer, archer, bruiser, golem,
      cleric. ChatGPT sheet'leri Python/PIL ile oyun-formatına çevrildi (başlık kırp, şeffaflaştır,
      96/112/192px grid). public/assets/units/. golem attack/death placeholder-kusurlu.
- [x] **Conquest fix:** clericUnlock koordinat çakışması (frostUnlock ile aynı x480y560) giderildi
      → x660y680. Mage node'u görünür oldu, cleric+bruiser zinciri açıldı.

Faz G ek işler (2026-10-28 TAMAMLANANLAR):
- [x] **7. birim — Buz Büyücüsü / Frost Mage (bluemage):** kontrol büyücüsü, yavaşlat + frost-stack
      dondur (zincir yok, düşük hasar). mage saf-hasara ayrıldı. conquest bluemageUnlock. (bkz. DECISIONS not)
- [x] **mage + cleric + bluemage sprite'ları bağlandı** (placeholder). Oyuncu kadrosu TAM (7 birim).

Kalan içerik (Faz G → asset/lore):
- [ ] **8 düşman sprite'ı** (ghoul/gargoyle/imp/soulVessel/cursedKnight/warden/ooze/cultist). PIL
      yöntemiyle bağlanır (ASSET-BRIEF §9). Düşman anahtarı `enemy-<key>`.
- [ ] Lore: boss banner, bestiary, idle popup necromancer sesi
- [ ] Spell efekt sprite'ları (necromancer soul bolt impact, freeze ring vb.)
- [ ] i18n: TR + EN parite (lore ayrı yazılır, birebir çeviri değil)

### Faz I — Kontrol Sistemi + Deploy Fazı + Conquest-Gate 🟡 (2026-10-28/31)
Bu oturumlarda eklenen oynanış sistemleri. Detay DECISIONS K38-K42.
- [x] **Kontrol (K38):** sol-tık seç/bırak, sağ-tık komut (yürü/saldır/iyileştir). Tüm birimler
      hareket eder (necromancer dahil). Komut hedefi ölene/yeni komuta kadar sadık; kovalama +
      hareket halinde ateş; melee savaştan sonra başladığı yere dönmez.
- [x] **Cleric hedefli iyileştirme (K38):** dost birime sağ-tık → full can olana kadar kilitli heal.
- [x] **Deploy fazı (K39):** her floor başı sıfırdan dizilim, ekip bara toplanır (kıdem korumalı park),
      kartla diz, "BAŞLA". Necromancer karttan ZORUNLU (otomatik yok). Savaşta craft edilen yerleştirilebilir.
- [x] **Necromancer mermi (K40):** beam yerine tek-tek mor ruh mermisi (soulBolt). Flick düzeldi.
- [x] **Conquest-gate (K41):** tüm kadro (necromancer hariç) conquest'ten açılır. archer da conquest'e
      bağlandı (archerUnlock → archerMastery).
- [x] **İki ekran iş bölümü + conquest-reorg (K42 — K41 revize):** Conquest map = TEK kazanım ekranı
      (unlock + signature); panel = işletme (stat/hire/sayı). Panelden unlock satın alma KALDIRILDI →
      kilitli birim "Fetih Haritası'nı Aç" ile yönlendirilir. 3-kolon ağaç (14 node): Necromancer&Komuta /
      Menzilli / Melee; tematik id rename; generic "+% stat" node temizliği; golem/bruiser panele hp+fireRate;
      golemUnlock 50<archerUnlock 70 (tank-first nudge); SaveManager v10 migration. Graf+migration testi +
      node --check + vite build geçti. (Signature'lar: archer Splash hazır; golem taunt/bruiser cleave vb.
      yetenek kodlanınca eklenecek.)
- [ ] **Sürükle-bırak dizme (Deploy Parça 4):** kartı tutup sahaya sürükle. Şu an seç-sağtık çalışıyor;
      sürükle-bırak PARK/kalan tek parça.

### Faz H — Cila
- [ ] Save version bump + temiz başlangıç
- [ ] Denge playtest (kullanıcı)
- [ ] Performans doğrulama (60 FPS)

## Park Listesi (v2)

Çekirdek çalışır olunca, playtest ile değerlendirilir:
- Veteran sistemi katkı-oranlı dağıtım varyantı (K37 eşit dağıtımı seçti; kill/hasar-oranlı park)
- Aktif soul-gücü (tıkla-harca yetenek)
- Necromancer oto-tamir node'u
- Ara seviye / checkpoint
- Pixel art tam geçiş
- Ses efektleri + müzik
- Roguelite derinleştirme

> Reddedilen fikirler ve gerekçeleri `DECISIONS.md`'de. Aynı tartışmayı yeniden açma.
