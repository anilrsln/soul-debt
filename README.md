# Soul Debt

Bıkkın bir necromancer'ın, yeraltının soul ile beslenen tanrısını devirmek için
her kat aşağı indiği, aktif bir **descent tower defense** oyunu. Düşmanlardan ruh
(soul) hasat et, ordunu bu ruhlarla kur, borcunu yönet ve dibe doğru ilerle.

> Web tarayıcıda çalışır. Phaser 3 + Vite + JavaScript (ES6+).
> Zero Stress King: Idle Defense klonundan pivot edilmiş özgün bir yapıt.

## Oyun Özeti

- **Tür:** Aktif descent tower defense (idle değil; oto-savaş, üstel büyüme ve
  kalıcı ilerlemeyi idle türünden miras alır).
- **Ekonomi:** Soul (evrensel kaynak) + üç dungeon meta'sı (Bone, Essence, Crystal).
- **Çekirdek gerilim:** Birimler ölür, necromancer onları otomatik diriltir — ama
  her diriliş soul yakar ve **soul-debt** biriktirir. Çok ölüm, borç spirali.
- **Kaybetme:** Düşman hattı aşıp necromancer'a ulaşır; canı biterse koşu sıfırlanır
  (zorlanmış prestige, yarı ödül). En dibe inip tanrıyı yenmek = gönüllü prestige,
  tam ödül.
- **Ton:** Kuru, bıkkın, kozmik-saçma mizah.

Tam tasarım için \`docs/SOUL-DEBT-DESIGN.md\`, kararların gerekçeleri için
\`docs/DECISIONS.md\`, kod geçiş planı için \`docs/MIGRATION.md\`.

## Geliştirme

\`\`\`bash
npm install      # bağımlılıkları kur
npm run dev      # geliştirme sunucusu (HMR)
npm run build    # production build
npm run preview  # build önizleme
\`\`\`

## Deployment

GitHub Actions ile otomatik: \`main\`'e push → Vite build → GitHub Pages
(\`.github/workflows/deploy.yml\`). Git push SSH ile yapılır.

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Game framework | Phaser 3.80+ |
| Bundler | Vite |
| Dil | JavaScript (ES6+) |
| i18n | Anahtar tabanlı, bağımlılıksız (TR + EN) |
| Performans | Object pooling (Enemy + Projectile) |
| Save | localStorage |

## Durum

Klon MVP tabanından Soul Debt'e geçiş aşamasında. Geçiş planı ve faz sırası:
\`docs/ROADMAP.md\` ve \`docs/MIGRATION.md\`.

## Lisans

Bkz. \`ATTRIBUTIONS.md\`. Asset kullanımında CC0/CC-BY tercih edilir.
