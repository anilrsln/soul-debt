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
| C | Necromancer varlığı + canı + hat ihlali (breachLine) | ⬜ |
| D | Soul-debt sistemi + otomatik diriltme (üç ceza) | ⬜ |
| E | Dur-dövüş + oyuncu dizilimi + kat-arası kurulum fazı | ⬜ |
| F | Prestige: iki yol (gönüllü/zorlanmış), Model Y çarpan | ⬜ |
| G | Ritim (kat döngüsü) + kadro (MVP 5 birim, ~12 arketip) + lore | ⬜ |
| H | Save version bump + denge + playtest cila | ⬜ |

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

### Faz C — Necromancer
- [ ] Sahnede konumlu, can havuzlu necromancer
- [ ] breachLine → can hasarı + soul-debt
- [ ] Her 10 wave full dolum; soul ile maxHp upgrade

### Faz D — Soul-Debt
- [ ] Otomatik diriltme: anlık soul + cooldown + biriken borç
- [ ] Borç zamanla + kill ile azalır
- [ ] Diriltme maliyeti soul-kapasiteyle ölçeklenir

### Faz E — Savaş Modeli
- [ ] Dur-dövüş (yoluna çıkan ilk birime çarp, karşılıklı HP) — en ağır kod işi
- [ ] Serbest (x,y) yerleştirme + ankerli otonomi (çıpa dairesi; önce sabit, sonra otonomi cilası)
- [ ] Kat-arası kurulum fazı (savaş durur, diz/absorbe/ekle)
- [ ] Harita zemini: tek yıkıntı-dungeon (engeller/köprü/meydan/dar boğaz)
- [ ] Düşman akışı: random spawn → yönel + engelden kaç (A* değil)
- [ ] Necromancer'ı oyuncu yerleştirir (büyük range)
- [ ] Object pooling reset() yeni alanlarla güncel

### Faz F — Prestige
- [ ] Gönüllü (tanrıyı yen → tam) + zorlanmış (necromancer öl → yarı, Diş 1)
- [ ] Model Y: çarpan derinliğe bağlı
- [ ] Kalıcı: çarpan + açılmış birim tipleri; gerisi sıfırlanır
- [ ] Tanrı Kat N'de + zafer ekranı + tekrar/endless seçeneği (K26)

### Faz G — Ritim + Kadro + Lore
- [ ] 10 wave = kat döngüsü, kat geçiş kartları
- [ ] MVP 5 birim (Taş Golem tank; DECISIONS K22), soulCapacity alanları
- [ ] ~10-12 düşman arketipi + kat varyantları, 5 boss rotasyonu
- [ ] Lore: boss banner, bestiary, idle popup necromancer sesi
- [ ] i18n: TR + EN parite (lore ayrı yazılır, birebir çeviri değil)

### Faz H — Cila
- [ ] Save version bump + temiz başlangıç
- [ ] Denge playtest (kullanıcı)
- [ ] Performans doğrulama (60 FPS)

## Park Listesi (v2)

Çekirdek çalışır olunca, playtest ile değerlendirilir:
- Unit kıdem/veteran sistemi (hayatta kalarak güçlenme — Yol B)
- Aktif soul-gücü (tıkla-harca yetenek)
- Necromancer oto-tamir node'u
- Ara seviye / checkpoint
- Pixel art tam geçiş
- Ses efektleri + müzik
- Roguelite derinleştirme

> Reddedilen fikirler ve gerekçeleri `DECISIONS.md`'de. Aynı tartışmayı yeniden açma.
