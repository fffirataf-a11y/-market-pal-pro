# 📱 Telefonda Test Rehberi - Hızlı Başlangıç

## ⚠️ ÖNEMLİ BİLGİLER

- ❌ **Expo YOK** - Bu proje **Capacitor** kullanıyor
- ✅ Reklamlar ve ödemeler **SADECE native platformlarda** çalışır (gerçek telefon veya emülatör)
- ❌ Web tarayıcıda reklamlar ve RevenueCat ödemeleri çalışmaz

---

## 🚀 Android Telefonda Test - 5 Adım

### 1️⃣ Android Studio'yu Aç

```bash
npm run cap:open:android
```

### 2️⃣ USB Debugging Açın (Telefonda)

1. **Ayarlar** > **Telefon Hakkında**
2. **Yapı Numarası**'na **7 kez** tıklayın
3. **Ayarlar** > **Geliştirici Seçenekleri** > **USB Debugging** açın

### 3️⃣ Telefonu Bağlayın

- Android telefonu USB ile bilgisayara bağlayın
- Telefonunuzda "USB Debugging izni ver" mesajı çıkarsa **"Allow"** deyin

### 4️⃣ Android Studio'da

1. **Gradle Sync:** Sağ üstte "Sync Now" butonuna tıklayın
2. **Cihaz Seçin:** Üstteki dropdown'dan telefonunuzu seçin
3. **Çalıştırın:** ▶️ (Run) butonuna tıklayın veya `Shift + F10`

### 5️⃣ Test Edin

Uygulama telefonunuzda açılacak. Test edin:

#### ✅ Reklam Testleri (Free Plan):

1. **App Open Ad:** Uygulamayı kapatıp tekrar açın → Reklam görmelisiniz
2. **Banner Ad:** Liste sayfasına gidin → Alt kısımda banner görmelisiniz
3. **Interstitial Ad:** Sayfa geçişi yapın → Geçiş reklamı görmelisiniz
4. **Rewarded Ad:** Settings sayfasında "Rewarded Ad" butonuna tıklayın → Ödüllü reklam görmelisiniz

#### ✅ Ödeme Testleri:

1. **Settings** sayfasına gidin
2. **Premium** veya **Pro** planı seçin
3. RevenueCat satın alma ekranı açılacak (test modunda)
4. Google Play test hesabıyla satın alma yapabilirsiniz

---

## 🔍 Logları Kontrol Etme

### Android Studio Logcat

1. Android Studio'da alt kısımda **Logcat** sekmesini açın
2. Filtre: `tag:Ads` veya `tag:RevenueCat`
3. Reklam ve ödeme loglarını görebilirsiniz

### Konsol Logları

- `[Ads] ✅` - Başarılı reklam işlemleri
- `[Ads] ❌` - Reklam hataları
- `RevenueCat initialized` - Ödeme sistemi başarıyla başlatıldı
- `Purchase result` - Satın alma sonuçları

---

## 🐛 Sorun Giderme

### "No devices found"

```bash
# Terminal'de kontrol edin
adb devices
```

Cihazınız listede görünmüyorsa:
- USB Debugging'i kontrol edin
- USB kablosunu değiştirin (veri aktarımı yapabilen kablo)
- Farklı bir USB portu deneyin

### Reklamlar Görünmüyor

1. **Logcat'te hataları kontrol edin:**
   - `tag:Ads` filtresi ile logları görün
   - Hata mesajlarını kontrol edin

2. **Plan kontrolü:**
   - Kullanıcı **free plan**'da olmalı
   - Premium/Pro kullanıcıları reklam görmez

3. **Test modu:**
   - Şu anda test modu aktif (`initializeForTesting: true`)
   - Test reklamları görmelisiniz (AdMob test reklamları)

### Ödeme Ekranı Açılmıyor

1. **Native platform kontrolü:**
   - Settings sayfasında plan seçerken RevenueCat kullanılır
   - Sadece native platformda çalışır (web'de çalışmaz)

2. **RevenueCat logları:**
   - Logcat'te `RevenueCat` ile arama yapın
   - Başlatma hatalarını kontrol edin

---

## 📝 Notlar

- **Test modu aktif:** İlk testlerde test reklamları göreceksiniz
- **Production:** Production'a geçmeden önce `adManager.ts` içinde `initializeForTesting: false` yapın
- **RevenueCat:** Test API key kullanılıyor (`test_nwXexLeAzfEaJLJyaBbAKLKNSWH`)
- **Google Play Console:** Gerçek test için Google Play Console'da test ürünleri oluşturmalısınız

---

## 🎯 Test Checklist

- [ ] Android Studio açıldı
- [ ] Telefon bağlandı ve görünüyor
- [ ] Uygulama telefonda çalışıyor
- [ ] App Open Ad çalışıyor
- [ ] Banner Ad görünüyor
- [ ] Interstitial Ad çalışıyor
- [ ] Rewarded Ad çalışıyor
- [ ] RevenueCat başlatılıyor (loglarda görülüyor)
- [ ] Ödeme ekranı açılıyor
- [ ] Premium/Pro plan seçilebiliyor

---

## 🚀 Hızlı Komutlar

```bash
# Build + Sync
npm run cap:sync

# Android Studio'yu aç
npm run cap:open:android

# Sadece build
npm run build

# ADB cihazları listele
adb devices
```

