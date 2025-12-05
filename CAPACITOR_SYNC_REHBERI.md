# Capacitor Sync - Adım Adım Rehber

## 🎯 Adım 2: Capacitor Sync

Capacitor sync, web uygulamanızdaki değişiklikleri (plugin'ler, config, vb.) native iOS ve Android projelerine kopyalar.

## 📋 Yapılacaklar

### 1. Önce Build Yapın (Önemli!)

Capacitor sync çalışmadan önce web uygulamanızı build etmeniz gerekiyor:

```bash
npm run build
```

Bu komut `dist` klasörünü oluşturur ve tüm dosyaları derler.

### 2. Capacitor Sync Çalıştırın

Build tamamlandıktan sonra:

```bash
npm run cap:sync
```

Bu komut:
- ✅ AdMob plugin'ini iOS ve Android projelerine ekler
- ✅ `capacitor.config.json`'daki App ID'leri native projelere kopyalar
- ✅ Gerekli native bağımlılıkları yükler
- ✅ Web dosyalarını (`dist` klasörünü) native projelere kopyalar

### 3. Alternatif: Tek Komutla

Eğer hem build hem sync yapmak isterseniz:

```bash
npm run build && npm run cap:sync
```

## ⚠️ Önemli Notlar

1. **Build önce yapılmalı:** `cap:sync` çalışmadan önce mutlaka `npm run build` yapın
2. **İlk kez çalıştırıyorsanız:** Native projeler henüz oluşturulmamışsa, önce şunları yapın:
   ```bash
   npm run cap:add:ios      # iOS için
   npm run cap:add:android  # Android için
   ```
3. **Hata alırsanız:** Terminal'deki hata mesajını paylaşın, birlikte çözelim

## ✅ Başarılı Olduğunda

Sync başarılı olduğunda şu mesajları göreceksiniz:
- ✅ "Sync completed"
- ✅ "Copying web assets..."
- ✅ "Updating native plugins..."

## 🚀 Sonraki Adım

Sync tamamlandıktan sonra:
- Native projeleri açabilirsiniz: `npm run cap:open:ios` veya `npm run cap:open:android`
- Uygulamayı test edebilirsiniz

