# Telefonda Test Etme Rehberi

## 📱 iOS için Test (iPhone/iPad)

### Gereksinimler
- Mac bilgisayar (Xcode sadece macOS'ta çalışır)
- Xcode yüklü olmalı
- Apple Developer hesabı (ücretsiz hesap yeterli, test için)
- iPhone/iPad (USB ile bağlanacak)

### Adımlar

1. **iOS Platformunu Ekle** (Eğer eklenmemişse)
   ```bash
   npm run cap:add:ios
   ```

2. **Sync Yap**
   ```bash
   npm run cap:sync
   ```

3. **Xcode'u Aç**
   ```bash
   npm run cap:open:ios
   ```

4. **Xcode'da Yapılacaklar:**
   - Sol üstte proje adını seçin
   - "Signing & Capabilities" sekmesine gidin
   - "Team" seçin (Apple ID'nizle giriş yapın)
   - Bundle Identifier'ı kontrol edin: `com.smartmarket.app`
   - iPhone/iPad'inizi USB ile Mac'e bağlayın
   - Üstte cihazınızı seçin
   - ▶️ (Run) butonuna tıklayın

5. **Cihazda İzin Verin:**
   - Cihazınızda "Trust This Computer" mesajı çıkarsa "Trust" deyin
   - Xcode'un cihazınızda uygulama çalıştırmasına izin verin

---

## 🤖 Android için Test (Android Telefon)

### Gereksinimler
- Android Studio yüklü olmalı
- Android telefon (USB ile bağlanacak veya emulator)
- USB Debugging açık olmalı

### Adımlar

1. **Android Platformunu Ekle** (Eğer eklenmemişse)
   ```bash
   npm run cap:add:android
   ```

2. **Sync Yap**
   ```bash
   npm run cap:sync
   ```

3. **Android Studio'yu Aç**
   ```bash
   npm run cap:open:android
   ```

4. **Android Studio'da Yapılacaklar:**
   - Gradle sync yapın (sağ üstte "Sync Now" butonu)
   - Android telefonunuzu USB ile bilgisayara bağlayın
   - Telefonunuzda "USB Debugging" açık olmalı
   - Telefonunuzda "Allow USB Debugging" mesajı çıkarsa "Allow" deyin
   - Android Studio'da cihazınızı seçin (üstte)
   - ▶️ (Run) butonuna tıklayın

5. **Telefonda İzin Verin:**
   - İlk kez çalıştırıyorsanız, telefonunuzda "Install from unknown source" izni isteyebilir
   - İzin verin

---

## 🔧 USB Debugging Nasıl Açılır? (Android)

1. Telefonunuzun **Ayarlar** > **Telefon Hakkında** bölümüne gidin
2. **Yapı Numarası**'na 7 kez tıklayın (Developer mode açılır)
3. **Ayarlar** > **Geliştirici Seçenekleri**'ne gidin
4. **USB Debugging**'i açın

---

## ⚠️ Sorun Giderme

### iOS'ta "No devices found" hatası
- iPhone/iPad'inizi USB ile bağladığınızdan emin olun
- Cihazınızda "Trust This Computer" dediğinizden emin olun
- Xcode'da Window > Devices and Simulators'dan cihazınızı kontrol edin

### Android'de "No devices found" hatası
- USB Debugging'in açık olduğundan emin olun
- USB kablosunun veri aktarımı yapabildiğinden emin olun (sadece şarj kablosu olmamalı)
- Terminal'de `adb devices` komutunu çalıştırın, cihazınız görünüyor mu kontrol edin

### "Build failed" hatası
- Xcode/Android Studio'da hata mesajını okuyun
- Genellikle signing veya dependency sorunları olabilir
- Hata mesajını paylaşın, birlikte çözelim

---

## 🧪 Test Senaryoları

Uygulamayı telefonda çalıştırdıktan sonra test edin:

1. **Free Plan Kullanıcısı Olarak:**
   - ✅ Banner ad görünmeli (sayfa altında)
   - ✅ App Open ad görünmeli (uygulama açılışında)
   - ✅ Interstitial ad görünmeli (sayfa geçişlerinde)
   - ✅ Rewarded ad çalışmalı (butona tıklayınca)

2. **Premium/Pro Plan Kullanıcısı Olarak:**
   - ❌ Hiçbir reklam görünmemeli

3. **Konsol Logları:**
   - Browser DevTools veya Xcode/Android Studio console'unda reklam loglarını kontrol edin
   - "[Ads] ✅" mesajları görmelisiniz

---

## 📝 Notlar

- İlk test için **test reklamları** göreceksiniz (gerçek reklamlar değil)
- Production'a geçmeden önce test modunu kapatmayı unutmayın
- AdMob Console'da reklam istatistiklerini görmek için biraz zaman gerekebilir

