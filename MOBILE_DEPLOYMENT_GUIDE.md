# 📱 iOS ve Android Yayınlama Rehberi

## ✅ Mevcut Durum

Uygulamanız **iOS ve Android'e yayınlamak için neredeyse hazır**, ancak birkaç adım daha gerekiyor.

### Hazır Olanlar:
- ✅ Capacitor yapılandırması (`capacitor.config.json`)
- ✅ RevenueCat entegrasyonu (in-app purchases)
- ✅ Firebase entegrasyonu
- ✅ Mobil platform kontrolü
- ✅ Gerekli Capacitor eklentileri eklendi

### Eksikler:
- ⚠️ iOS ve Android native projeleri henüz oluşturulmadı
- ⚠️ Native kamera entegrasyonu (barkod tarayıcı için)
- ⚠️ Native push notification yapılandırması

---

## 🚀 Adım Adım Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

Bu komut yeni eklenen Capacitor eklentilerini yükleyecek:
- `@capacitor/app` - Uygulama yaşam döngüsü
- `@capacitor/camera` - Kamera erişimi
- `@capacitor/push-notifications` - Push bildirimleri
- `@capacitor/splash-screen` - Splash screen
- `@capacitor/status-bar` - Status bar kontrolü
- `@capacitor/haptics` - Titreşim geri bildirimi
- `@capacitor/keyboard` - Klavye kontrolü

### 2. Web Uygulamasını Build Et

```bash
npm run build
```

### 3. iOS Projesi Oluştur (Mac gerektirir)

```bash
npm run cap:add:ios
npm run cap:sync
```

**Not:** iOS geliştirme için Mac ve Xcode gereklidir.

### 4. Android Projesi Oluştur

```bash
npm run cap:add:android
npm run cap:sync
```

**Not:** Android geliştirme için Android Studio gereklidir.

### 5. Native Projeleri Aç

**iOS için:**
```bash
npm run cap:open:ios
```

**Android için:**
```bash
npm run cap:open:android
```

---

## 📝 Yapılması Gerekenler

### A. iOS Yayınlama İçin

1. **Apple Developer Hesabı:**
   - Apple Developer Program'a kaydolun ($99/yıl)
   - https://developer.apple.com

2. **Xcode Yapılandırması:**
   - Xcode'da projeyi açın (`npm run cap:open:ios`)
   - Signing & Capabilities'de Team seçin
   - Bundle Identifier'ı kontrol edin (`com.smartmarket.app`)
   - App Icon ve Launch Screen ekleyin

3. **App Store Connect:**
   - App Store Connect'te yeni uygulama oluşturun
   - Screenshot'lar, açıklama, kategori vb. ekleyin
   - TestFlight ile test edin

4. **Push Notifications:**
   - Apple Developer Portal'da Push Notification sertifikası oluşturun
   - Firebase Console'da iOS uygulaması ekleyin
   - `GoogleService-Info.plist` dosyasını iOS projesine ekleyin

### B. Android Yayınlama İçin

1. **Google Play Developer Hesabı:**
   - Google Play Console'a kaydolun ($25 tek seferlik)
   - https://play.google.com/console

2. **Android Studio Yapılandırması:**
   - Android Studio'da projeyi açın (`npm run cap:open:android`)
   - `app/build.gradle` dosyasında `versionCode` ve `versionName` ayarlayın
   - Signing config oluşturun (release key)
   - App Icon ve Splash Screen ekleyin

3. **Google Play Console:**
   - Yeni uygulama oluşturun
   - Store listing bilgilerini doldurun
   - APK veya AAB yükleyin
   - Internal/Alpha/Beta test yapın

4. **Push Notifications:**
   - Firebase Console'da Android uygulaması ekleyin
   - `google-services.json` dosyasını `android/app/` klasörüne ekleyin
   - FCM server key'i Firebase Console'dan alın

---

## 🔧 Kod Güncellemeleri Gerekli

### 1. Barkod Tarayıcı - Native Kamera Entegrasyonu

Mevcut `BarcodeScanner.tsx` web API kullanıyor. Native kamera için güncellenmeli:

```typescript
// Capacitor Camera plugin kullanımı örneği
import { Camera } from '@capacitor/camera';

// Native platformda Capacitor Camera kullan
if (Capacitor.isNativePlatform()) {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
  });
  // Gemini API'ye gönder
} else {
  // Web için mevcut kod
}
```

### 2. Push Notifications - Native FCM

`useNotifications.ts` dosyası web için yazılmış. Native için güncellenmeli:

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Native platformda Capacitor Push Notifications kullan
if (Capacitor.isNativePlatform()) {
  await PushNotifications.requestPermissions();
  const registration = await PushNotifications.register();
  // Token'ı Firebase'e kaydet
}
```

---

## 📦 Build ve Yayınlama

### iOS Build

```bash
# 1. Web build
npm run build

# 2. Capacitor sync
npm run cap:sync

# 3. Xcode'da Archive oluştur
npm run cap:open:ios
# Xcode'da: Product > Archive

# 4. App Store Connect'e yükle
# Xcode Organizer'dan "Distribute App"
```

### Android Build

```bash
# 1. Web build
npm run build

# 2. Capacitor sync
npm run cap:sync

# 3. Android Studio'da Release APK/AAB oluştur
npm run cap:open:android
# Android Studio'da: Build > Generate Signed Bundle / APK

# 4. Google Play Console'a yükle
```

---

## ⚠️ Önemli Notlar

1. **Test API Keys:**
   - `capacitor.config.json`'daki RevenueCat API key test key'i. Production için değiştirin.
   - Firebase config production için kontrol edin.

2. **Permissions:**
   - iOS: `Info.plist` dosyasında kamera izni açıklaması ekleyin
   - Android: `AndroidManifest.xml` dosyasında izinler kontrol edin

3. **App Icons:**
   - iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Android: `android/app/src/main/res/` altında mipmap klasörleri

4. **Splash Screen:**
   - Capacitor config'de yapılandırıldı
   - Görselleri native projelere ekleyin

5. **Version Management:**
   - `package.json`'daki version'ı güncelleyin
   - iOS: `ios/App/App.xcodeproj/project.pbxproj`
   - Android: `android/app/build.gradle`

---

## 🎯 Sonraki Adımlar

1. ✅ Capacitor eklentileri eklendi
2. ⏳ Native projeleri oluştur (`npm run cap:add:ios` ve `npm run cap:add:android`)
3. ⏳ Barkod tarayıcıyı native kamera ile güncelle
4. ⏳ Push notifications'ı native FCM ile güncelle
5. ⏳ App icon ve splash screen ekle
6. ⏳ Test et ve yayınla

---

## 📚 Faydalı Linkler

- [Capacitor Dokümantasyonu](https://capacitorjs.com/docs)
- [iOS Yayınlama Rehberi](https://capacitorjs.com/docs/ios/deploying-to-app-store)
- [Android Yayınlama Rehberi](https://capacitorjs.com/docs/android/deploying-to-google-play)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [RevenueCat Dokümantasyonu](https://docs.revenuecat.com/)

---

## ❓ Sorun Giderme

### "Command not found: cap"
```bash
npm install -g @capacitor/cli
```

### iOS build hatası
- Xcode Command Line Tools yüklü mü kontrol edin
- CocoaPods yüklü mü kontrol edin: `pod --version`
- `ios/App/` klasöründe `pod install` çalıştırın

### Android build hatası
- Android SDK yüklü mü kontrol edin
- `ANDROID_HOME` environment variable ayarlı mı kontrol edin
- Gradle sync yapın (Android Studio'da)

---

**Son Güncelleme:** Bu rehber uygulamanın mevcut durumuna göre hazırlanmıştır. Native projeler oluşturulduktan sonra ek yapılandırmalar gerekebilir.

