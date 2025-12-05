# Android Telefonda Test Etme - Adım Adım

## 📱 Android Telefonda Test

Windows bilgisayarınızda olduğunuz için **Android** telefonla test edebilirsiniz. iOS için Mac gerekiyor.

---

## 🔧 Ön Hazırlık

### 1. Android Studio Kurulumu
- [Android Studio](https://developer.android.com/studio) indirip kurun
- Kurulum sırasında "Android SDK" ve "Android SDK Platform" seçeneklerini kurun

### 2. USB Debugging Açın (Telefonda)

1. Telefonunuzun **Ayarlar** > **Telefon Hakkında** bölümüne gidin
2. **Yapı Numarası**'na **7 kez** tıklayın
   - "Developer mode açıldı" mesajı göreceksiniz
3. **Ayarlar** > **Geliştirici Seçenekleri**'ne gidin
4. **USB Debugging**'i **AÇIN**

---

## 🚀 Test Adımları

### Adım 1: Android Platformunu Ekle (Yapıldı ✅)

```bash
npm run cap:add:android
```

### Adım 2: Sync Yap

```bash
npm run cap:sync
```

### Adım 3: Android Studio'yu Aç

```bash
npm run cap:open:android
```

### Adım 4: Android Studio'da

1. **Gradle Sync:** Sağ üstte "Sync Now" butonuna tıklayın (veya File > Sync Project with Gradle Files)
2. **Telefonu Bağlayın:**
   - Android telefonunuzu USB ile bilgisayara bağlayın
   - Telefonunuzda "USB Debugging izni ver" mesajı çıkarsa **"Allow"** deyin
3. **Cihazı Seçin:**
   - Android Studio'nun üst kısmında cihaz seçici menüsünden telefonunuzu seçin
4. **Çalıştırın:**
   - ▶️ (Run) butonuna tıklayın
   - Veya `Shift + F10` tuşlarına basın

### Adım 5: İlk Kurulum

- İlk kez çalıştırıyorsanız, telefonunuzda "Install from unknown source" izni isteyebilir
- **"Allow"** deyin
- Uygulama telefonunuza yüklenecek ve otomatik açılacak

---

## 🧪 Test Senaryoları

Uygulama telefonunuzda açıldıktan sonra:

### 1. Free Plan Kullanıcısı Olarak Test

1. **App Open Ad:**
   - Uygulamayı kapatıp tekrar açın
   - Uygulama açılışında reklam görmelisiniz ✅

2. **Banner Ad:**
   - Liste sayfasına gidin (`/lists`)
   - Sayfa altında banner reklam görmelisiniz ✅

3. **Interstitial Ad:**
   - Bir liste oluşturun veya sayfa geçişi yapın
   - Geçiş reklamı görmelisiniz ✅

4. **Rewarded Ad:**
   - Settings sayfasına gidin
   - Rewarded ad butonuna tıklayın
   - Ödüllü reklam görmelisiniz ✅

### 2. Premium/Pro Plan Kullanıcısı Olarak Test

- Settings'ten planı premium/pro yapın
- Hiçbir reklam görünmemeli ❌

---

## 🔍 Sorun Giderme

### "No devices found" Hatası

1. **USB Debugging Kontrolü:**
   - Telefonunuzda USB Debugging'in açık olduğundan emin olun
   - Ayarlar > Geliştirici Seçenekleri > USB Debugging

2. **USB Kablosu:**
   - Veri aktarımı yapabilen bir USB kablosu kullanın (sadece şarj kablosu olmamalı)
   - Farklı bir USB portu deneyin

3. **ADB Kontrolü:**
   - Terminal'de şu komutu çalıştırın:
   ```bash
   adb devices
   ```
   - Cihazınız listede görünüyorsa sorun yok
   - Görünmüyorsa USB driver'ları yükleyin

### "Build failed" Hatası

1. **Gradle Sync:**
   - Android Studio'da File > Sync Project with Gradle Files
   - Hata mesajını okuyun ve paylaşın

2. **SDK Kontrolü:**
   - File > Project Structure > SDK Location
   - Android SDK'nın doğru yolda olduğundan emin olun

### Reklamlar Görünmüyor

1. **Konsol Logları:**
   - Android Studio'da Logcat sekmesini açın
   - "[Ads]" ile başlayan logları kontrol edin
   - Hata mesajları varsa paylaşın

2. **Plan Kontrolü:**
   - Kullanıcının planını kontrol edin (free olmalı)
   - Settings sayfasından planı kontrol edin

3. **Test Modu:**
   - Şu anda test modu aktif (`initializeForTesting: true`)
   - Test reklamları görmelisiniz

---

## 📝 Notlar

- İlk test için **test reklamları** göreceksiniz (gerçek reklamlar değil)
- AdMob Console'da reklam istatistiklerini görmek için biraz zaman gerekebilir
- Production'a geçmeden önce test modunu kapatmayı unutmayın

---

## 🎯 Sonraki Adımlar

Test başarılı olduktan sonra:
1. ✅ Mediation Group yapılandırması (opsiyonel)
2. ✅ Component entegrasyonları (Banner, Interstitial sayfalara ekleme)
3. ✅ Production'a geçiş (test modunu kapatma)

