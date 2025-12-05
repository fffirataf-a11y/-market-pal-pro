# AdMob Kurulum Adımları - Detaylı Rehber

## ⚠️ ÖNEMLİ: Önce Ödeme Ayarlarını Tamamlayın

Görsellerden görüldüğü üzere, AdMob hesabınızda **ödeme ayarları tamamlanmamış**. Bu adımı tamamlamadan uygulamalarınız incelemeye alınmayacak.

### 1. Ödeme Ayarlarını Tamamlayın

1. AdMob Console'da kırmızı banner'daki **"Sorunu giderin"** butonuna tıklayın
2. Ödeme bilgilerinizi girin (banka hesabı, vergi bilgileri, vb.)
3. Ödeme profilinizi tamamlayın
4. Doğrulama adımlarını tamamlayın

**Not:** Ödeme eşiğiniz €200. Bu tutara ulaştığınızda aylık ödeme yapılacak.

---

## 📱 Adım 1: Uygulama Oluşturma

### iOS Uygulaması Oluşturma

1. AdMob Console'da sol menüden **"Uygulamalar"** (Apps) sekmesine gidin
2. **"+ Uygulama ekle"** butonuna tıklayın
3. **"iOS"** platformunu seçin
4. Uygulama bilgilerini girin:
   - **Uygulama adı:** SmartMarket (veya istediğiniz isim)
   - **App Store URL:** (henüz yoksa boş bırakabilirsiniz, sonra ekleyebilirsiniz)
5. **"Ekle"** butonuna tıklayın
6. **iOS App ID'yi kopyalayın** (örnek: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`)

### Android Uygulaması Oluşturma

1. AdMob Console'da **"+ Uygulama ekle"** butonuna tekrar tıklayın
2. **"Android"** platformunu seçin
3. Uygulama bilgilerini girin:
   - **Uygulama adı:** SmartMarket (veya istediğiniz isim)
   - **Package name:** `com.smartmarket.app` (capacitor.config.json'daki appId ile aynı olmalı)
   - **Google Play URL:** (henüz yoksa boş bırakabilirsiniz)
4. **"Ekle"** butonuna tıklayın
5. **Android App ID'yi kopyalayın** (örnek: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`)

---

## 🎯 Adım 2: Rewarded Ad Unit'leri Oluşturma

Her platform için ayrı ad unit oluşturmanız gerekiyor.

### iOS Rewarded Ad Unit

1. Oluşturduğunuz iOS uygulamasına tıklayın
2. **"Ad units"** sekmesine gidin
3. **"+ Ad unit ekle"** butonuna tıklayın
4. **"Rewarded"** ad formatını seçin
5. Ad unit bilgilerini girin:
   - **Ad unit adı:** "Rewarded Ad - iOS" (veya istediğiniz isim)
6. **"Ad unit ekle"** butonuna tıklayın
7. **iOS Ad Unit ID'yi kopyalayın** (örnek: `ca-app-pub-XXXXXXXXXX/XXXXXXXXXX`)

### Android Rewarded Ad Unit

1. Oluşturduğunuz Android uygulamasına tıklayın
2. **"Ad units"** sekmesine gidin
3. **"+ Ad unit ekle"** butonuna tıklayın
4. **"Rewarded"** ad formatını seçin
5. Ad unit bilgilerini girin:
   - **Ad unit adı:** "Rewarded Ad - Android" (veya istediğiniz isim)
6. **"Ad unit ekle"** butonuna tıklayın
7. **Android Ad Unit ID'yi kopyalayın** (örnek: `ca-app-pub-XXXXXXXXXX/XXXXXXXXXX`)

---

## 🔗 Adım 3: Mediation Group Oluşturma ve Ağları Ekleme

AdMob Mediation, görselde belirtilen tüm ağları otomatik olarak yönetir ve en yüksek teklifi veren ağı seçer.

### Mediation Group Oluşturma

1. AdMob Console'da sol menüden **"Uyumlulaştırma"** (Mediation) sekmesine gidin
2. **"+ Mediation group oluştur"** butonuna tıklayın
3. Mediation group bilgilerini girin:
   - **Grup adı:** "SmartMarket Rewarded Ads" (veya istediğiniz isim)
   - **Ad format:** "Rewarded" seçin
   - **Platform:** iOS ve Android için ayrı ayrı oluşturmanız gerekebilir
4. **"Oluştur"** butonuna tıklayın

### Reklam Ağlarını Ekleme

Mediation group'unuza aşağıdaki ağları ekleyebilirsiniz:

1. **Google AdMob** (varsayılan olarak zaten ekli)
2. **Meta Ads (Facebook)**
3. **Unity Ads**
4. **AppLovin**
5. **ironSource**
6. **InMobi**
7. **Smaato**
8. **Chartboost**
9. **PubMatic**
10. **Tapjoy**
11. **AdColony**
12. **Vungle**
13. **Fyber**
14. **MoPub**
15. **AppLovin MAX**

**Her ağ için:**
- Ağın adını seçin
- Gerekli SDK bilgilerini ve API key'lerini girin (her ağın kendi hesabından alınır)
- Ağın kendi hesabında uygulamanızı kaydetmeniz gerekebilir

**ÖNEMLİ:** Her ağ için ayrı bir hesap açmanız gerekebilir. Ancak AdMob Mediation, tüm ağları tek bir yerden yönetmenizi sağlar.

### Mediation Group'u Ad Unit'e Bağlama

1. Oluşturduğunuz mediation group'a tıklayın
2. **"Ad units"** sekmesine gidin
3. **"+ Ad unit ekle"** butonuna tıklayın
4. Oluşturduğunuz rewarded ad unit'lerinizi seçin (iOS ve Android)
5. **"Kaydet"** butonuna tıklayın

---

## 💻 Adım 4: Kodda ID'leri Güncelleme

Gerçek App ID ve Ad Unit ID'leri aldıktan sonra, kodda test ID'lerini değiştirmeniz gerekiyor.

### `src/lib/adManager.ts` Dosyasını Güncelleme

```typescript
// AdMob App ID'leri - GERÇEK ID'LERİNİZİ BURAYA YAZIN
const ADMOB_APP_IDS = {
  ios: "ca-app-pub-XXXXXXXXXX~XXXXXXXXXX", // iOS App ID'nizi buraya yazın
  android: "ca-app-pub-XXXXXXXXXX~XXXXXXXXXX", // Android App ID'nizi buraya yazın
};

// Rewarded Ad Unit ID'leri - GERÇEK ID'LERİNİZİ BURAYA YAZIN
const REWARDED_AD_UNIT_IDS = {
  ios: "ca-app-pub-XXXXXXXXXX/XXXXXXXXXX", // iOS Ad Unit ID'nizi buraya yazın
  android: "ca-app-pub-XXXXXXXXXX/XXXXXXXXXX", // Android Ad Unit ID'nizi buraya yazın
};
```

### `capacitor.config.json` Dosyasını Güncelleme

```json
"AdMob": {
  "appId": {
    "ios": "ca-app-pub-XXXXXXXXXX~XXXXXXXXXX", // iOS App ID'nizi buraya yazın
    "android": "ca-app-pub-XXXXXXXXXX~XXXXXXXXXX" // Android App ID'nizi buraya yazın
  }
}
```

---

## 🧪 Adım 5: Test Modunu Kapatma (Production'a Geçerken)

Production'a geçmeden önce test modunu kapatın:

`src/lib/adManager.ts` dosyasında:

```typescript
await AdMob.initialize({
  requestTrackingAuthorization: true,
  testingDevices: [], // Test cihazlarınızı buraya ekleyebilirsiniz
  initializeForTesting: false, // Production için false yapın
});
```

---

## 📋 Özet Checklist

- [ ] ✅ Ödeme ayarlarını tamamladım
- [ ] ✅ iOS uygulaması oluşturdum ve App ID'yi aldım
- [ ] ✅ Android uygulaması oluşturdum ve App ID'yi aldım
- [ ] ✅ iOS Rewarded Ad Unit oluşturdum ve Ad Unit ID'yi aldım
- [ ] ✅ Android Rewarded Ad Unit oluşturdum ve Ad Unit ID'yi aldım
- [ ] ✅ Mediation group oluşturdum
- [ ] ✅ İstediğim reklam ağlarını mediation group'a ekledim
- [ ] ✅ Mediation group'u ad unit'lere bağladım
- [ ] ✅ `src/lib/adManager.ts` dosyasındaki ID'leri güncelledim
- [ ] ✅ `capacitor.config.json` dosyasındaki ID'leri güncelledim
- [ ] ✅ Capacitor sync yaptım (`npm run cap:sync`)
- [ ] ✅ Uygulamayı test ettim

---

## ⚠️ Önemli Notlar

1. **Test ID'leri:** Şu anda kodda test ID'leri kullanılıyor. Production'a geçmeden önce mutlaka gerçek ID'lerinizle değiştirin.

2. **Reklam Ağları:** Her ağ için ayrı hesap açmanız gerekebilir. Ancak AdMob Mediation sayesinde tüm ağları tek bir yerden yönetirsiniz.

3. **Ödeme Eşiği:** €200 eşiğine ulaştığınızda aylık ödeme yapılacak.

4. **Uygulama İncelemesi:** Ödeme ayarlarını tamamlamadan uygulamalarınız incelemeye alınmayacak.

5. **Mediation Otomatik Çalışır:** Mediation group'u yapılandırdıktan sonra, AdMob otomatik olarak en yüksek teklifi veren ağı seçer. Kod tarafında ek bir işlem gerekmez.

---

## 🆘 Yardım

Sorun yaşarsanız:
- [AdMob Dokümantasyonu](https://developers.google.com/admob)
- [AdMob Mediation Rehberi](https://developers.google.com/admob/mediation)
- [Capacitor AdMob Plugin](https://github.com/capacitor-community/admob)


