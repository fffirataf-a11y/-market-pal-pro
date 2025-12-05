# 🚀 Android Studio Kurulumu Sonrası - Adım Adım Rehber

## ✅ Tamamlanan İşlemler
- ✅ Proje build edildi
- ✅ Capacitor sync yapıldı
- ✅ Android platformu hazır

---

## 📋 Android Studio Kurulum Sırasında Önemli Notlar

### Android Studio'yu Kurarken:
1. **SDK Manager'da şunları kurun:**
   - ✅ Android SDK Platform (en son sürüm - örn: Android 14)
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator (opsiyonel - fiziksel telefon varsa gerek yok)

2. **License Kabul:**
   - Kurulum sırasında SDK license'ları kabul etmeniz istenecek
   - Terminal'de: `sdkmanager --licenses` (gerekirse)

---

## 🎯 Android Studio Kurulumundan Sonra İzlenecek Adımlar

### 1️⃣ Projeyi Android Studio'da Açın

```bash
npm run cap:open:android
```

Bu komut Android Studio'yu açıp projeyi yükleyecek.

**VEYA** manuel olarak:
- Android Studio'yu açın
- "Open an Existing Project" seçin
- `C:\Users\firat\market-pal-pro\android` klasörünü seçin

### 2️⃣ Gradle Sync Yapın

Android Studio açıldıktan sonra:

1. **Otomatik:** Android Studio otomatik olarak Gradle sync başlatabilir
2. **Manuel:** Sağ üstte "Sync Now" butonuna tıklayın
   - Veya: `File > Sync Project with Gradle Files`

⚠️ **İlk sync 5-10 dakika sürebilir** (Gradle bağımlılıkları indiriliyor)

### 3️⃣ SDK Location Kontrolü (Gerekirse)

Eğer hata alırsanız:

1. `File > Project Structure > SDK Location`
2. Android SDK Location yolunu kontrol edin
   - Genellikle: `C:\Users\firat\AppData\Local\Android\Sdk`

### 4️⃣ Telefonunuzu Hazırlayın

#### USB Debugging Açın:

1. Telefonunuzun **Ayarlar** > **Telefon Hakkında** bölümüne gidin
2. **Yapı Numarası**'na **7 kez** tıklayın
   - "Developer mode açıldı" mesajı göreceksiniz ✅
3. **Ayarlar** > **Geliştirici Seçenekleri**'ne gidin
4. **USB Debugging**'i **AÇIN** ✅

### 5️⃣ Telefonu Bağlayın ve Test Edin

#### Android Studio'da:

1. **Telefonu USB ile bağlayın**
   - Veri aktarımı yapabilen bir USB kablosu kullanın (sadece şarj kablosu olmamalı)

2. **USB Debugging İzni:**
   - Telefonunuzda "USB Debugging izni ver" mesajı çıkarsa **"Allow"** deyin
   - "Always allow from this computer" kutusunu işaretleyin

3. **Cihazı Seçin:**
   - Android Studio'nun üst kısmında cihaz seçici menüsünden telefonunuzu seçin
   - Telefonunuz listede görünmelidir (örn: "Samsung SM-G991B" gibi)

4. **Çalıştırın:**
   - ▶️ (Run) butonuna tıklayın
   - Veya `Shift + F10` tuşlarına basın
   - Veya `Run > Run 'app'`

### 6️⃣ İlk Kurulum İzinleri

İlk kez çalıştırıyorsanız telefonunuzda:
- "Install from unknown source" izni isteyebilir → **"Allow"** deyin
- Uygulama telefonunuza yüklenecek ve otomatik açılacak ✅

---

## 🧪 Telefonda Test Senaryoları

### ✅ Reklam Testleri (Free Plan Olarak):

1. **App Open Ad:**
   - Uygulamayı tamamen kapatın (arka plandan da kaldırın)
   - Tekrar açın
   - Uygulama açılışında reklam görmelisiniz ✅

2. **Banner Ad:**
   - Liste sayfasına gidin (`/lists` veya "Listelerim")
   - Sayfa altında banner reklam görmelisiniz ✅

3. **Interstitial Ad:**
   - Bir liste oluşturun veya başka bir sayfaya geçin
   - Geçiş reklamı görmelisiniz ✅

4. **Rewarded Ad:**
   - Settings (Ayarlar) sayfasına gidin
   - "Rewarded Ad" veya "Ödüllü Reklam" butonuna tıklayın
   - Ödüllü reklam görmelisiniz ✅

### ✅ Ödeme Testleri:

1. **Settings** sayfasına gidin
2. **Premium** veya **Pro** planını seçin
3. RevenueCat satın alma ekranı açılacak
4. Google Play test hesabıyla satın alma yapabilirsiniz
   - Test modunda olduğu için gerçek para çekilmez ✅

### ✅ Premium/Pro Plan Testi:

1. Settings'ten planı **premium** veya **pro** yapın
2. Uygulamayı dolaşın
3. **Hiçbir reklam görünmemeli** ❌ (Bu doğru!)

---

## 🔍 Logları Kontrol Etme

### Android Studio Logcat:

1. Android Studio'da alt kısımda **Logcat** sekmesini açın
2. Filtre ekleyin:
   - `tag:Ads` - Reklam logları
   - `RevenueCat` - Ödeme logları
   - `SmartMarket` - Uygulama logları

3. Beklenen loglar:
   ```
   [Ads] ✅ AdMob initialized successfully
   [Ads] 🎯 Loading banner ad...
   [Ads] ✅ Banner ad shown
   RevenueCat initialized successfully
   Purchase result: ...
   ```

### Terminal'de ADB Kontrolü:

```bash
# Cihazların listesini görmek için
adb devices

# Logları görmek için
adb logcat | findstr "Ads RevenueCat"
```

---

## 🐛 Yaygın Sorunlar ve Çözümleri

### ❌ "No devices found" Hatası

**Çözüm:**
1. USB Debugging açık mı kontrol edin
2. USB kablosunu değiştirin (veri aktarımı yapabilen)
3. Farklı bir USB portu deneyin
4. Telefonu çıkarıp tekrar takın

**Kontrol:**
```bash
adb devices
```
Cihazınız listede görünmüyorsa driver sorunu olabilir.

### ❌ "Gradle sync failed" Hatası

**Çözüm:**
1. Internet bağlantınızı kontrol edin
2. `File > Invalidate Caches / Restart` yapın
3. `File > Sync Project with Gradle Files` tekrar yapın
4. SDK Location'ı kontrol edin

### ❌ "Build failed" Hatası

**Çözüm:**
1. Logcat'teki hata mesajını okuyun
2. Genellikle dependency veya SDK sorunudur
3. `File > Project Structure > SDK Location` kontrol edin
4. Android SDK'nın güncel olduğundan emin olun

### ❌ Reklamlar Görünmüyor

**Kontrol Listesi:**
1. ✅ Logcat'te hataları kontrol edin (`tag:Ads`)
2. ✅ Kullanıcının planı **free** olmalı
3. ✅ Test modu aktif (`initializeForTesting: true`)
4. ✅ Internet bağlantısı var mı?

### ❌ Ödeme Ekranı Açılmıyor

**Kontrol Listesi:**
1. ✅ Native platformda mı çalışıyorsunuz? (Web'de çalışmaz)
2. ✅ RevenueCat loglarını kontrol edin (`RevenueCat`)
3. ✅ Internet bağlantısı var mı?

---

## 📝 Önemli Notlar

- ⚠️ **Test Modu Aktif:** İlk testlerde test reklamları göreceksiniz (gerçek reklamlar değil)
- ⚠️ **Production:** Production'a geçmeden önce `src/lib/adManager.ts` içinde `initializeForTesting: false` yapın
- ⚠️ **RevenueCat Test Key:** Şu anda test API key kullanılıyor
- ⚠️ **Google Play Console:** Gerçek test için Google Play Console'da test ürünleri oluşturmalısınız

---

## 🎯 Sonraki Adımlar

Test başarılı olduktan sonra:
1. ✅ Reklam ve ödeme loglarını analiz edin
2. ✅ Production'a geçiş hazırlıkları (test modunu kapatma)
3. ✅ Google Play Console'da ürünleri oluşturma
4. ✅ AdMob Console'da reklam performansını takip etme

---

## 🚀 Hızlı Komutlar

```bash
# Build + Sync
npm run cap:sync

# Android Studio'yu aç
npm run cap:open:android

# ADB cihazları listele
adb devices

# Logları izle
adb logcat | findstr "Ads RevenueCat"
```

---

## ✅ Checklist

Android Studio kurulumundan sonra:
- [ ] Android Studio açıldı
- [ ] Proje açıldı (`android` klasörü)
- [ ] Gradle sync tamamlandı (hata yok)
- [ ] USB Debugging açıldı (telefonda)
- [ ] Telefon bağlandı ve Android Studio'da görünüyor
- [ ] Uygulama telefonda çalıştırıldı
- [ ] Reklamlar test edildi
- [ ] Ödeme ekranı test edildi
- [ ] Loglar kontrol edildi

---

**Hazır olduğunuzda haber verin, birlikte test edelim! 🚀**

