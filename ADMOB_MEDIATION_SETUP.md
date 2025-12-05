# AdMob Mediation Kurulum Rehberi

Bu dokümantasyon, uygulamanızda AdMob Mediation kullanarak birden fazla reklam ağından en yüksek teklifi veren ağın otomatik olarak seçilmesi için gerekli adımları açıklar.

## 🎯 Özellikler

AdMob Mediation sistemi, aşağıdaki reklam ağlarını otomatik olarak yönetir ve her reklam gösterimi için en yüksek teklifi veren ağın reklamını gösterir:

- ✅ Google AdMob
- ✅ Meta Ads (Facebook)
- ✅ Unity Ads
- ✅ AppLovin
- ✅ ironSource
- ✅ InMobi
- ✅ Smaato
- ✅ Chartboost
- ✅ PubMatic
- ✅ Tapjoy
- ✅ AdColony
- ✅ Vungle
- ✅ Fyber
- ✅ MoPub
- ✅ AppLovin MAX

## 📋 Kurulum Adımları

### 1. AdMob Hesabı Oluşturma

1. [AdMob Console](https://apps.admob.com/) adresine gidin
2. Google hesabınızla giriş yapın
3. Yeni bir uygulama oluşturun (iOS ve Android için ayrı ayrı)

### 2. Ad Unit ID'leri Alma

1. AdMob Console'da uygulamanızı seçin
2. "Ad units" sekmesine gidin
3. "Rewarded" ad unit tipini seçin
4. Her platform için (iOS ve Android) bir ad unit oluşturun
5. Ad unit ID'lerini kopyalayın

### 3. Production Ad Unit ID'lerini Güncelleme

`src/lib/adManager.ts` dosyasında test ID'lerini production ID'lerinizle değiştirin:

```typescript
const REWARDED_AD_UNIT_IDS = {
  ios: "ca-app-pub-XXXXXXXXXX/XXXXXXXXXX", // Gerçek iOS Ad Unit ID
  android: "ca-app-pub-XXXXXXXXXX/XXXXXXXXXX", // Gerçek Android Ad Unit ID
};
```

### 4. AdMob Mediation Yapılandırması

1. AdMob Console'da "Mediation" sekmesine gidin
2. Yeni bir mediation group oluşturun
3. İstediğiniz reklam ağlarını ekleyin (Meta Ads, Unity Ads, AppLovin, vb.)
4. Her ağ için gerekli SDK'ları ve API key'leri yapılandırın
5. Mediation group'u ad unit'inize bağlayın

**Önemli:** AdMob Mediation, tüm yapılandırılmış ağlardan gerçek zamanlı teklif alır ve en yüksek teklifi veren ağın reklamını otomatik olarak gösterir. Bu işlem tamamen otomatiktir ve kod tarafında ek bir işlem gerektirmez.

### 5. Capacitor Sync

Plugin'i native projelerinize eklemek için:

```bash
npm run cap:sync
```

### 6. iOS Yapılandırması

iOS için `Info.plist` dosyasına AdMob App ID eklenmelidir (Capacitor sync sırasında otomatik eklenir).

### 7. Android Yapılandırması

Android için `AndroidManifest.xml` dosyasına AdMob App ID eklenmelidir (Capacitor sync sırasında otomatik eklenir).

## 🔧 Test Modu

Şu anda test modu aktif. Production'a geçmeden önce:

1. `src/lib/adManager.ts` dosyasında `initializeForTesting: true` değerini `false` yapın
2. Test cihazlarınızı `testingDevices` array'ine ekleyin (opsiyonel)

## 💡 Nasıl Çalışır?

1. Kullanıcı bir rewarded ad izlemek istediğinde, `showRewardedAdPlaceholder()` fonksiyonu çağrılır
2. AdMob SDK, AdMob Mediation üzerinden yapılandırılmış tüm ağlara teklif isteği gönderir
3. Her ağ gerçek zamanlı olarak teklif verir
4. AdMob Mediation, en yüksek teklifi veren ağı seçer
5. Seçilen ağın reklamı gösterilir
6. Kullanıcı reklamı tamamladığında ödül verilir

## 📊 Gelir Optimizasyonu

AdMob Mediation kullanmanın avantajları:

- **Otomatik Optimizasyon:** Her gösterimde en yüksek teklifi veren ağ seçilir
- **Zaman Tasarrufu:** Manuel waterfall yapılandırmasına gerek yok
- **Daha Yüksek Gelir:** Gerçek zamanlı açık artırma sayesinde eCPM'ler artar
- **Kolay Yönetim:** Tüm ağlar tek bir dashboard'dan yönetilir

## 🚀 Production'a Geçiş

1. AdMob Console'da gerçek ad unit'lerinizi oluşturun
2. Mediation group'unuzu production ad unit'lerinize bağlayın
3. `src/lib/adManager.ts` dosyasındaki test ID'lerini production ID'lerle değiştirin
4. Test modunu kapatın
5. Uygulamayı test edin
6. Production'a deploy edin

## 📝 Notlar

- Test ID'leri şu anda kullanılıyor (production'da değiştirilmeli)
- AdMob Mediation yapılandırması AdMob Console üzerinden yapılır
- Kod tarafında ek bir işlem gerekmez - AdMob Mediation otomatik olarak en yüksek teklifi seçer
- Tüm reklam ağları AdMob Mediation dashboard'unda yapılandırılmalıdır

## 🔗 Yararlı Linkler

- [AdMob Mediation Dokümantasyonu](https://developers.google.com/admob/mediation)
- [AdMob Bidding Rehberi](https://admob.google.com/intl/tr/home/bidding/what-is-bidding/)
- [Capacitor AdMob Plugin](https://github.com/capacitor-community/admob)

