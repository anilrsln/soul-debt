# Soul Debt — Klon→Soul Debt Geçiş Planı

> Elimizde **çalışan bir MVP** var (Zero Stress King klonu, "Idle Kingdom Defense").
> Bu dosya, o kodu Soul Debt'e nasıl evireceğimizin teknik yol haritasıdır.
> Sıfırdan yazmıyoruz: kodun ~%70'i miras alınır. Aşağıda neyin korunduğu, silindiği, değiştiği ve eklendiği dosya düzeyinde listelenir.
> Tasarımın "neden"i için `SOUL-DEBT-DESIGN.md` ve `DECISIONS.md`'ye bakın.

---

## 0. Repo Kurulumu — DURUM: KISMEN TAMAMLANDI

Bu repo (`soul-debt`), eski MVP'den (`/Users/ege/Desktop/idle-kingdom-defense`)
temiz-kopya olarak türetildi. Kopyalanırken `node_modules/`, `dist/`, `.git/` ve
`vite.config.js.timestamp-*.mjs` artıkları hariç tutuldu. Şu kimlik değişiklikleri
yapıldı:

- `package.json`: name → `soul-debt`, description + keywords güncellendi.
- `package-lock.json`: kök name → `soul-debt`.
- `index.html`: `<title>` → `Soul Debt`.
- `README.md`: Soul Debt sürümüyle değiştirildi.
- Tasarım dokümanları `docs/` altına yerleştirildi.
- `vite.config.js`: `base: './'` (göreli yollar) → GitHub Pages için ekstra base
  path ayarı GEREKMİYOR, olduğu gibi bırakıldı.
- `.github/workflows/deploy.yml`: workflow repo adından bağımsız, olduğu gibi çalışır.

### Senin yapacakların (GitHub + ilk push)

Repo klasöründe (`~/Desktop/soul-debt`) ilk commit zaten atıldı (bkz. aşağıda).
Kalan adımlar:

```bash
# 1. GitHub'da yeni boş repo oluştur (web arayüzü veya gh):
gh repo create anilrsln/soul-debt --private --source=. --remote=origin --push
# (gh yoksa: GitHub'da elle 'soul-debt' reposu aç, sonra:)
#   git remote add origin git@github.com:anilrsln/soul-debt.git
#   git push -u origin main

# 2. Bağımlılıkları kur ve çalıştığını doğrula:
cd ~/Desktop/soul-debt
npm install
npm run dev     # tarayıcıda aç, MVP hâlâ çalışmalı (henüz Soul Debt değişiklikleri yok)

# 3. GitHub Pages'i aç: repo Settings → Pages → Source: GitHub Actions
#    (deploy.yml zaten main'e push'ta tetiklenir)
```

> **Not:** Eski repo (`idle-kingdom-defense`) arşiv olarak yerinde kalır, dokunulmadı.
> Push SSH ile yapılır (eski repo da SSH remote kullanıyordu).

---

## 1. SİLİNECEK — Lava Mekaniği (Tamamen)

Bu, kodun en çetrefilli ve en çok oturum-notu biriktirmiş kısmı. Soul Debt'te hat ihlali tek bir olaya iner (düşman WALL_X'i geçer → necromancer'a ulaşır), bu yüzden lava'nın tüm izleri kaldırılır.

- `Enemy.js`: `dieToLava()` sil, `dieToWall()` → `breachLine()` (necromancer'a hasar + soul-debt) olarak yeniden yaz.
- `GameScene.js`: `drawLava()` sil; `CONFIG.LAVA_X` runtime override mantığı sil.
- `config.js`: `LAVA_X` sabiti sil.
- `ConquestManager.js`: `getLavaExpRate()` ve `lavaConversion` node'u sil.
- `Enemy.update()`: lava/sur tetik sırası mantığını tek `breachLine()` tetiğiyle değiştir.

## 2. DEĞİŞECEK — Ekonomi (EXP→Soul, Food→3 Meta)

- `GameState.js`: `resources.exp` → `resources.soul`; `resources.food` → `resources.bone`, `resources.essence`, `resources.crystal`. `lifetimeSoul` sayacı ekle (onboarding tetiği, bkz. DESIGN 5.3).
- `EconomyManager.js`: EXP kazanım/harcama → soul. Food kazanım → meta drop (düşman tipine göre bone/essence/crystal). Hire mantığı Model 3'e göre yeniden yaz (tip açma = node/soul; birim örme = soul + o birimin meta'sı — bkz. DESIGN 5.2b / DECISIONS K18).
- `UpgradeManager.js`: maliyet kaynağı EXP→soul. Formüller aynı (`baseCost × 1.15^level`).
- `ConquestManager.js`: node maliyetleri soul. Yeni `unitUnlock` node türü ekle — birim *tipini* açan node'lar (yalnız soul + prerequisite; meta örmede harcanır, açmada değil — DECISIONS K21/K18). Level gate yok (DECISIONS K2).
- `NumberFormatter.js`: değişmez (soul da büyük sayı).
- **UI:** 4 sayaç (soul + 3 meta). Ekran kalabalığı açık nokta (DESIGN 11).

## 3. YENİ — Necromancer Varlığı ve Canı

- Yeni entity veya GameScene'de somut varlık: sahnede konumlu, can havuzu olan necromancer.
- `GameState.js`: `necromancer: { hp, maxHp }`.
- Hat ihlalinde (`breachLine`) hasar alır + soul-debt bindirir.
- Her 10 wave (kat sonu) full dolum. Soul ile maxHp upgrade (yeni upgrade kolu).
- HP sıfırlanırsa → zorlanmış prestige tetiği (bkz. 6).

## 4. YENİ — Soul-Debt Sistemi

- Yeni manager veya EconomyManager içinde: `soulDebt` state'i.
- Birim ölünce otomatik diriltme: anlık soul maliyeti + cooldown + borç artışı (DESIGN 6.4).
- Borç zamanla + kill ile azalır.
- Diriltme maliyeti birimin soul-kapasitesiyle ölçeklenir (DECISIONS K12).

## 5. YENİ/DEĞİŞEN — Savaş Modeli (Dur-Dövüş + Dizilim)

- `Enemy.js` + `Defender.js`: lane-blocking. Düşman birime ulaşınca durur; karşılıklı HP döngüsü. Bu mevcut "menzilden vur, düşman geçer" modelini değiştirir — en büyük kod işi burada.
- `GameScene.syncDefenders`: korunur ama kurulum fazıyla entegre olur (dizilim kat aralarında değişir, savaş içinde sabit — DESIGN 6.2).
- Kat-arası kurulum fazı: yeni UI/state modu (savaş durur, oyuncu dizer/absorbe eder, sonra iner).
- Object pooling: korunur (Enemy + Projectile). Yeni state alanları (soul-kapasite, debt vb.) eklenince `reset()`'e de eklenmeli — yoksa havuzdan dönen nesnede eski state sızar.

## 6. DEĞİŞECEK — Prestige

- `PrestigeManager.js`: iskelet korunur. İki yol ekle: gönüllü (tanrıyı yen → tam çarpan) ve zorlanmış (necromancer öl → yarı çarpan, Diş 1 — DECISIONS K14).
- Çarpan Model Y: ulaşılan derinliğe (kat) bağlı (DECISIONS K15). Mevcut `1 + count×0.5` formülü derinlik-ölçekli hale getirilir.
- Kalıcı kalan: çarpan + açılmış birim tipleri. Sıfırlanan: koşu-içi her şey.

## 7. YENİ — Ritim ve Lore Katmanı

- `WaveManager.js`: boss rotasyonu korunur. "10 wave = kat" döngüsü + kat-arası faz tetiği eklenir. Boss = kat bekçisi; Crystal meta'sı yalnız boss'tan düşer.
- Lore kanalları (non-blocking): boss banner, kat geçiş kartı, bestiary ekranı, idle popup necromancer sesi. Yeni UI parçaları + i18n anahtarları.

## 8. YENİ — Kadro (Tema + İçerik)

- `config.js` ASSETS/ENEMIES/DEFENDERS: MVP'de 5 birim (DESIGN 8.1 / DECISIONS K22; en az 1 tank — Taş Golem), çekirdek çalışınca hedef kadroya doğru genişler. ~10-12 düşman arketipi (+ kat varyantları), 5 boss rotasyonu yeniden temalanır.
- Her birime `soulCapacity` alanı (güç/dayanıklılık/diriltme maliyeti türetilir).
- Placeholder geometri → ileride pixel art (park'ta).

## 9. DEĞİŞECEK — Save

- `SaveManager.js`: iskelet korunur. Save version bump (eski save'ler uyumsuz — temiz başlangıç). Yeni state alanları (soul, 3 meta, necromancer, soulDebt, lifetimeSoul) serialize edilir.

---

## Önerilen Uygulama Sırası (Faz)

Her faz çalışır bir ara durum bırakmalı; büyük patlama yerine kademeli.

1. **Faz A — Temizlik:** Lava sök (bölüm 1). Oyun hâlâ çalışır (düşman sur'da ödülsüz ölür, geçici).
2. **Faz B — Ekonomi:** EXP→Soul, Food→meta, Model 3 (bölüm 2). UI 4 sayaç.
3. **Faz C — Necromancer + hat ihlali:** Varlık, can, breachLine (bölüm 3).
4. **Faz D — Soul-debt + oto-diriltme:** (bölüm 4).
5. **Faz E — Dur-dövüş + dizilim + kurulum fazı:** En ağır kod işi (bölüm 5).
6. **Faz F — Prestige (iki yol, Model Y):** (bölüm 6).
7. **Faz G — Ritim + kadro + lore:** Kat döngüsü, MVP 5 birim + arketipler, banner/bestiary (bölüm 7-8). (Not: MVP kadrosu 5; birimler Faz B'den itibaren kademeli gelir, Faz G sadece tam içerik/temayı kapatır.)
8. **Faz H — Save + cila:** Version bump, denge, playtest (bölüm 9).

Denge değerleri baştan sona placeholder; playtest ile iteratif ayarlanır.
