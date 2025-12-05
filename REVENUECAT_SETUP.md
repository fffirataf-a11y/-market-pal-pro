# RevenueCat Kurulum Rehberi

## 📋 Mevcut Durum

Şu anda **test API key** kullanılıyor:
- Test Key: `test_nwXexLeAzfEaJLJyaBbAKLKNSWH`
- Bu key sadece test amaçlıdır, production'da çalışmaz

## 🔧 RevenueCat'te Proje Kurulumu

### 1. RevenueCat Dashboard'a Giriş
- https://app.revenuecat.com/ adresine gidin
- SmartMarket projenizi seçin veya yeni proje oluşturun

### 2. API Key'leri Alın

#### iOS için:
1. RevenueCat Dashboard → **Project Settings** → **API Keys**
2. **Public SDK Keys** bölümünden **iOS** key'ini kopyalayın
3. Format: `appl_xxxxxxxxxxxxx`

#### Android için:
1. RevenueCat Dashboard → **Project Settings** → **API Keys**
2. **Public SDK Keys** bölümünden **Google Play** key'ini kopyalayın
3. Format: `goog_xxxxxxxxxxxxx`

### 3. Kodda Güncelleme

`src/hooks/usePurchases.tsx` dosyasında:

```typescript
const REVENUECAT_API_KEY = {
  ios: 'appl_YOUR_IOS_KEY_HERE',        // iOS Public SDK Key
  android: 'goog_YOUR_ANDROID_KEY_HERE', // Android Public SDK Key
};
```

### 4. Capacitor Config Güncelleme

`capacitor.config.json` dosyasında:

```json
{
  "plugins": {
    "PurchasesPlugin": {
      "apiKey": "appl_YOUR_IOS_KEY_HERE"  // iOS key (default)
    }
  }
}
```

## 📦 Products ve Offerings Kurulumu

### 1. Products Oluşturma

RevenueCat Dashboard → **Products** → **Add Product**:

#### Premium Plan:
- **Product ID**: `premium_monthly`
- **Type**: Subscription
- **Duration**: 1 Month
- **Price**: Belirlediğiniz fiyat

#### Pro Plan:
- **Product ID**: `pro_monthly`
- **Type**: Subscription
- **Duration**: 1 Month
- **Price**: Belirlediğiniz fiyat

### 2. Entitlements Oluşturma

RevenueCat Dashboard → **Entitlements** → **Add Entitlement**:

#### Premium Entitlement:
- **Identifier**: `premium`
- **Products**: `premium_monthly` ekleyin

#### Pro Entitlement:
- **Identifier**: `pro`
- **Products**: `pro_monthly` ekleyin

### 3. Offerings Oluşturma

RevenueCat Dashboard → **Offerings** → **Add Offering**:

- **Identifier**: `default` (veya istediğiniz isim)
- **Packages** ekleyin:
  - Package 1: `premium_monthly` → Identifier: `premium_monthly`
  - Package 2: `pro_monthly` → Identifier: `pro_monthly`

## ✅ Test Etme

### Sandbox Test:
1. iOS: TestFlight veya Sandbox tester hesabı
2. Android: Internal testing track

### Test Kullanıcıları:
- RevenueCat Dashboard → **Customers** → Test kullanıcıları ekleyin

## 🔐 Güvenlik Notları

1. **API Key'leri asla public repository'ye commit etmeyin**
2. Environment variables kullanın:
   ```env
   REVENUECAT_IOS_KEY=appl_xxxxx
   REVENUECAT_ANDROID_KEY=goog_xxxxx
   ```
3. Production'da test key'leri kullanmayın

## 📚 Kaynaklar

- [RevenueCat Dokümantasyonu](https://docs.revenuecat.com/)
- [Capacitor Entegrasyonu](https://docs.revenuecat.com/docs/capacitor)
- [iOS Setup](https://docs.revenuecat.com/docs/ios)
- [Android Setup](https://docs.revenuecat.com/docs/android)

