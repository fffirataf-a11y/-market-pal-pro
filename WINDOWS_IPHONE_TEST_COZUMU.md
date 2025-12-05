# Windows + iPhone Test Çözümleri

## 🎯 En Hızlı Test Yöntemleri

Windows bilgisayarınızda olduğunuz için iOS native test yapamazsınız (Mac gerekiyor). İşte en hızlı alternatifler:

---

## ⚡ Seçenek 1: Android Emulator (ÖNERİLEN - En Hızlı)

Android Studio'da emulator çalıştırıp test edebilirsiniz. AdMob native plugin'i çalışacak.

### Adımlar:

1. **Android Studio'yu Açın:**
   ```bash
   npm run cap:open:android
   ```

2. **Emulator Oluşturun:**
   - Android Studio'da **Tools > Device Manager**
   - **Create Device** butonuna tıklayın
   - Bir telefon modeli seçin (örn: Pixel 5)
   - System Image seçin (API 33 veya üzeri önerilir)
   - **Finish** deyin

3. **Emulator'ü Başlatın:**
   - Device Manager'dan oluşturduğunuz emulator'ü ▶️ butonuna tıklayarak başlatın

4. **Uygulamayı Çalıştırın:**
   - Android Studio'da emulator'ü seçin (üstte)
   - ▶️ (Run) butonuna tıklayın
   - Uygulama emulator'de açılacak

### Avantajları:
- ✅ Hemen test edebilirsiniz
- ✅ AdMob native plugin çalışır
- ✅ Gerçek reklamlar görünür
- ✅ Mac gerekmez

### Dezavantajları:
- ⚠️ Emulator biraz yavaş olabilir
- ⚠️ İlk kurulum biraz zaman alır

---

## 🌐 Seçenek 2: Web Versiyonunu iPhone'da Test Etme

Web versiyonunu local network üzerinden iPhone'unuzda açabilirsiniz, ama **AdMob çalışmaz** (sadece placeholder).

### Adımlar:

1. **Local Server Başlatın:**
   ```bash
   npm run dev
   ```
   Terminal'de şu mesajı göreceksiniz:
   ```
   Local:   http://localhost:5173/
   Network: http://192.168.x.x:5173/
   ```

2. **iPhone'unuzda:**
   - iPhone ve bilgisayar aynı Wi-Fi ağında olmalı
   - iPhone'da Safari'yi açın
   - Adres çubuğuna `http://192.168.x.x:5173` yazın (x.x yerine terminal'deki IP)
   - Uygulama açılacak

### Avantajları:
- ✅ Çok hızlı
- ✅ iPhone'da görünümü test edebilirsiniz
- ✅ UI/UX testi yapabilirsiniz

### Dezavantajları:
- ❌ AdMob native plugin çalışmaz (sadece placeholder)
- ❌ Gerçek reklamlar görünmez
- ❌ Native özellikler test edilemez

---

## 📱 Seçenek 3: Android Telefon Bulma/Ödünç Alma

Bir Android telefon bulup test edebilirsiniz.

### Adımlar:
- Android telefonu USB ile bağlayın
- USB Debugging açın
- Android Studio'da çalıştırın

### Avantajları:
- ✅ Gerçek cihazda test
- ✅ AdMob tam çalışır
- ✅ En gerçekçi test

---

## 🍎 Seçenek 4: Mac Bulma / Cloud Build

### Alternatifler:
1. **Mac ödünç alma** - Arkadaşınızdan/okuldan Mac ödünç alın
2. **Cloud Mac servisleri** - MacStadium, AWS Mac gibi servisler (ücretli)
3. **EAS Build** - Expo'nun cloud build servisi (ücretli)

---

## 🎯 ÖNERİM: Android Emulator Kullanın

**En hızlı ve pratik çözüm Android Emulator'dür:**

1. ✅ Hemen başlayabilirsiniz
2. ✅ AdMob tam çalışır
3. ✅ Mac gerekmez
4. ✅ Ücretsiz

### Hızlı Başlangıç:

```bash
# 1. Android Studio'yu aç
npm run cap:open:android

# 2. Android Studio'da:
# - Tools > Device Manager
# - Create Device (Pixel 5 önerilir)
# - Emulator'ü başlat
# - Run butonuna tıkla
```

---

## 📋 Test Checklist (Emulator'de)

Emulator'de test ederken kontrol edin:

- [ ] App Open Ad görünüyor mu? (Uygulama açılışında)
- [ ] Banner Ad görünüyor mu? (Liste sayfasında)
- [ ] Interstitial Ad görünüyor mu? (Sayfa geçişlerinde)
- [ ] Rewarded Ad çalışıyor mu? (Settings'te butona tıklayınca)
- [ ] Premium/Pro plan kullanıcıları reklam görmüyor mu?

---

## ⚠️ Önemli Notlar

1. **iOS Test İçin:**
   - iOS native test için mutlaka Mac gerekiyor
   - Şimdilik Android'de test edin
   - iOS testini daha sonra Mac'te yapabilirsiniz

2. **Production'a Geçmeden Önce:**
   - Mutlaka gerçek iOS cihazda test edin (Mac bulduğunuzda)
   - Test modunu kapatmayı unutmayın

3. **AdMob Console:**
   - Test reklamları AdMob Console'da görünmeyebilir
   - Bu normal, production'da görünecek

---

## 🚀 Hemen Başlayın

**En hızlı yol: Android Emulator**

1. `npm run cap:open:android` çalıştırın
2. Android Studio'da emulator oluşturun
3. Test edin!

Sorun olursa haber verin! 🎯

