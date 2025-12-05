# APK Build ve Telefona Yükleme Rehberi

## 🚀 Android Studio Olmadan APK Build

Android Studio kasıyorsa, terminal'den direkt APK build edip telefonunuza yükleyebilirsiniz!

---

## 📱 Yöntem 1: APK Build + USB ile Yükleme (En Hızlı)

### Adım 1: APK Build (Terminal'de)

```bash
cd android
.\gradlew assembleDebug
```

Bu komut:
- Android Studio açmadan APK oluşturur
- APK şurada olacak: `android/app/build/outputs/apk/debug/app-debug.apk`

### Adım 2: APK'yı Telefona Yükleme

**Seçenek A: USB ile (En Hızlı)**
1. Android telefonunuzu USB ile bilgisayara bağlayın
2. Telefonunuzda "File Transfer" modunu seçin
3. `app-debug.apk` dosyasını telefonunuzun Downloads klasörüne kopyalayın
4. Telefonda dosya yöneticisinden APK'yı bulup tıklayın
5. "Install from unknown source" izni verin
6. Yükleyin!

**Seçenek B: Google Drive ile**
1. `app-debug.apk` dosyasını Google Drive'a yükleyin
2. Telefonunuzdan Google Drive'ı açın
3. APK'yı indirin ve yükleyin

**Seçenek C: Email ile**
1. APK'yı kendinize email atın
2. Telefonda email'i açın
3. APK'yı indirin ve yükleyin

---

## 🌐 Yöntem 2: Google Play Console - Internal Testing

### Adımlar:

1. **Google Play Console'a Giriş:**
   - https://play.google.com/console adresine gidin
   - Google Developer hesabınızla giriş yapın

2. **Uygulama Oluştur:**
   - Sol menüden "Tüm uygulamalar" > "Uygulama oluştur"
   - Uygulama adı: "SmartMarket"
   - Varsayılan dil: Türkçe
   - Uygulama türü: Uygulama
   - Ücretsiz/Ücretli: Ücretsiz
   - "Uygulama oluştur" butonuna tıklayın

3. **APK Yükle:**
   - Sol menüden "Yayın" > "Test" > "Internal testing"
   - "Yeni sürüm oluştur" butonuna tıklayın
   - "APK'yı veya Android App Bundle'ı yükle" bölümüne `app-debug.apk` dosyasını sürükleyin
   - "İnceleme için gönder" butonuna tıklayın

4. **Test Kullanıcısı Ekle:**
   - "Test kullanıcıları" sekmesine gidin
   - Email adresinizi ekleyin
   - "Kaydet" butonuna tıklayın

5. **Test Et:**
   - Telefonunuzda Play Store'u açın
   - Test linkini açın (size email ile gönderilecek)
   - Veya Play Store'da "SmartMarket" arayın (Internal Testing'de görünecek)

---

## 🔥 Yöntem 3: Firebase App Distribution (Önerilir)

### Avantajları:
- ✅ Çok hızlı
- ✅ Kolay kullanım
- ✅ Test kullanıcıları yönetimi
- ✅ Otomatik bildirimler

### Adımlar:

1. **Firebase Console:**
   - https://console.firebase.google.com adresine gidin
   - Projenizi seçin veya yeni proje oluşturun

2. **App Distribution Kurulumu:**
   - Sol menüden "App Distribution" seçin
   - "Get started" butonuna tıklayın

3. **APK Yükle:**
   - "Distribute app" butonuna tıklayın
   - `app-debug.apk` dosyasını yükleyin
   - Test grubu oluşturun (kendinizi ekleyin)
   - "Distribute" butonuna tıklayın

4. **Test Et:**
   - Email'inize test linki gelecek
   - Linke tıklayın, APK indirilip yüklenecek

---

## ⚡ Hızlı Başlangıç (Önerilen)

**En hızlı yol: APK Build + USB**

```bash
# 1. APK build et
cd android
.\gradlew assembleDebug

# 2. APK şurada: android/app/build/outputs/apk/debug/app-debug.apk
# 3. USB ile telefona kopyala ve yükle
```

---

## 📝 Notlar

- **İlk build uzun sürebilir** (5-10 dakika) - Gradle dosyaları indirilecek
- **Sonraki build'ler hızlı olacak** (1-2 dakika)
- **APK boyutu:** ~50-100 MB olabilir
- **Test modu aktif:** Production'a geçmeden önce kapatmayı unutmayın

---

## 🎯 Öneri

**En pratik çözüm:** APK build edip USB ile telefona yükleme. Android Studio'ya gerek yok!

Hemen deneyelim mi? 🚀

