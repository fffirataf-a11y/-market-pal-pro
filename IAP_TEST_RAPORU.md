# In-App Purchase Test Raporu

## 📋 Mevcut Durum Analizi

### ✅ Kod Tarafı (Implementation)
- ✅ **RevenueCat Entegrasyonu:** `src/hooks/usePurchases.tsx` içinde tam entegre
- ✅ **Settings Sayfası:** Upgrade butonları ve IAP akışı hazır
- ✅ **Premium/Pro Paketleri:** `premium_monthly` ve `pro_monthly` tanımlı
- ✅ **Entitlements:** `premium` ve `pro` entitlement'ları kodda kontrol ediliyor

### ⚠️ Yapılandırma Durumu

#### RevenueCat API Keys:
```typescript
// src/hooks/usePurchases.tsx
const REVENUECAT_API_KEY = {
  ios: 'test_nwXexLeAzfEaJLJyaBbAKLKNSWH',      // ❌ TEST KEY
  android: 'test_nwXexLeAzfEaJLJyaBbAKLKNSWH',  // ❌ TEST KEY
};
```

**⚠️ UYARI:** Şu anda TEST API key kullanılıyor. Production için gerçek key'ler gerekiyor.

#### iOS Platform:
- ❌ **iOS klasörü henüz eklenmemiş** (`ios` klasörü yok)
- ❌ Apple App Store Connect entegrasyonu yapılmamış
- ❌ iOS için gerçek RevenueCat API key'i eklenmemiş

#### Android Platform:
- ✅ Android platformu mevcut (`android` klasörü var)
- ⚠️ Test API key kullanılıyor

---

## 🧪 Test Senaryoları

### 1. Web Platformunda Test
**Durum:** ❌ Çalışmaz (Beklenen)
- IAP sadece native platformlarda çalışır
- Web'de `/checkout` sayfasına yönlendirme yapılıyor

**Kod Kontrolü:**
```typescript
// src/pages/Settings.tsx - handleUpgrade
if (!Capacitor.isNativePlatform()) {
  navigate(`/checkout?plan=${planId}`);  // ✅ Web için checkout sayfası
  return;
}
```

### 2. Android Platformunda Test
**Durum:** ⚠️ Test modunda çalışmalı

**Gereken Adımlar:**
1. ✅ RevenueCat initialize ediliyor mu?
2. ✅ Offerings yükleniyor mu?
3. ✅ Packages (`premium_monthly`, `pro_monthly`) bulunuyor mu?
4. ⚠️ RevenueCat Dashboard'da Products/Offerings oluşturulmuş mu?

**Test Komutları:**
```bash
# Android'de logları kontrol et
adb logcat | findstr "RevenueCat"

# Beklenen loglar:
# ✅ RevenueCat initialized successfully
# 📦 Available offerings: {...}
# 👤 Customer info: {...}
```

### 3. iOS Platformunda Test
**Durum:** ❌ Henüz hazır değil

**Gereken Adımlar:**
1. ❌ iOS platformu eklenmemiş
   ```bash
   npm run cap:add:ios
   ```
2. ❌ Apple App Store Connect'te ürünler oluşturulmamış
3. ❌ RevenueCat Dashboard'da iOS için API key eklenmemiş
4. ❌ iOS için gerçek API key (`appl_xxxxx`) kodda güncellenmemiş

---

## 🔍 RevenueCat Dashboard Kontrolleri

### Yapılması Gerekenler:

1. **Products Oluşturuldu mu?**
   - `premium_monthly` (Subscription - 1 Month)
   - `pro_monthly` (Subscription - 1 Month)

2. **Entitlements Oluşturuldu mu?**
   - `premium` → `premium_monthly` eklenmeli
   - `pro` → `pro_monthly` eklenmeli

3. **Offerings Oluşturuldu mu?**
   - Offering identifier: `default` (veya kodda kullanılan)
   - Packages:
     - Package identifier: `premium_monthly`
     - Package identifier: `pro_monthly`

4. **API Keys Alındı mı?**
   - iOS: `appl_xxxxxxxxxxxxx` (Production)
   - Android: `goog_xxxxxxxxxxxxx` (Production)

---

## 🐛 Olası Sorunlar ve Çözümleri

### Sorun 1: "Ürün bulunamadı" Hatası
**Sebep:** RevenueCat Dashboard'da offerings/packages oluşturulmamış

**Çözüm:**
1. RevenueCat Dashboard → Offerings
2. `default` offering oluştur
3. Packages ekle: `premium_monthly`, `pro_monthly`

### Sorun 2: "Package not found" Hatası
**Sebep:** Package identifier'lar eşleşmiyor

**Kod Kontrolü:**
```typescript
// usePurchases.tsx - premium_monthly ve pro_monthly bekleniyor
const premiumPackage = offering.availablePackages.find(
  (pkg) => pkg.identifier === 'premium_monthly'  // ✅ Bu identifier kullanılıyor
);
```

**Çözüm:** RevenueCat Dashboard'da package identifier'ları kontrol et

### Sorun 3: iOS'da Çalışmıyor
**Sebep:** iOS platformu eklenmemiş

**Çözüm:**
```bash
# 1. iOS platformunu ekle
npm run cap:add:ios

# 2. iOS için API key'i güncelle
# src/hooks/usePurchases.tsx içinde
ios: 'appl_YOUR_REAL_IOS_KEY_HERE'

# 3. Apple App Store Connect'te ürünleri oluştur
# 4. RevenueCat Dashboard'da iOS app'i bağla
```

---

## 📝 Yapılacaklar Listesi

### Acil (Production'a Geçmeden Önce):
- [ ] RevenueCat Dashboard'da Products oluştur
- [ ] RevenueCat Dashboard'da Entitlements oluştur  
- [ ] RevenueCat Dashboard'da Offerings oluştur
- [ ] Production API keys al (iOS ve Android)
- [ ] Kodda production API keys'e güncelle

### iOS için:
- [ ] iOS platformunu ekle (`npm run cap:add:ios`)
- [ ] Apple App Store Connect'te ürünleri oluştur
- [ ] RevenueCat Dashboard'da iOS app'i bağla
- [ ] iOS için production API key'i ekle

### Test için:
- [ ] Android'de IAP akışını test et
- [ ] Offerings yükleniyor mu kontrol et
- [ ] Packages bulunuyor mu kontrol et
- [ ] Satın alma ekranı açılıyor mu test et
- [ ] Sandbox test hesabıyla satın alma dene

---

## 🔗 İlgili Dosyalar

- `src/hooks/usePurchases.tsx` - RevenueCat entegrasyonu
- `src/pages/Settings.tsx` - Upgrade butonları ve IAP akışı
- `capacitor.config.json` - RevenueCat plugin config
- `REVENUECAT_SETUP.md` - Kurulum rehberi

---

**Son Güncelleme:** Bugün
**Test Durumu:** ⚠️ Yapılandırma eksik, kod hazır

---

## 🧪 Test Sonuçları

### Android Test (Gerekli):
1. ✅ **RevenueCat Initialize:** Kodda hazır - test edilmesi gerekiyor
2. ⚠️ **Offerings Yükleme:** RevenueCat Dashboard'da offerings oluşturulmamış olabilir
3. ⚠️ **Packages:** `premium_monthly` ve `pro_monthly` bulunmalı
4. ❌ **Satın Alma Akışı:** Test edilmesi gerekiyor

### iOS Test (Henüz Yapılamaz):
- ❌ iOS platformu eklenmemiş
- ❌ Apple entegrasyonu yapılmamış

---

## 📱 Android'de Test Nasıl Yapılır?

### 1. Uygulamayı Telefonda Çalıştır:
```bash
# Build + Sync
npm run cap:sync

# Android Studio'yu aç
npm run cap:open:android

# Telefonda çalıştır (Android Studio'dan Run butonuna bas)
```

### 2. Settings Sayfasına Git:
- Uygulamada Settings sayfasına git
- Subscription Plans bölümünü aç

### 3. Logları Kontrol Et:
```bash
# Android Studio Logcat'te:
# Filter: RevenueCat

# Beklenen loglar:
✅ RevenueCat initialized successfully
📦 Available offerings: {...}
👤 Customer info: {...}
✅ Premium plan package found: premium_monthly (veya ⚠️ not found)
✅ Pro plan package found: pro_monthly (veya ⚠️ not found)
```

### 4. Upgrade Butonuna Bas:
- Premium veya Pro plan seç
- Upgrade butonuna bas
- Eğer RevenueCat Dashboard'da offerings yoksa: "Ürün bulunamadı" hatası
- Eğer offerings varsa ama packages yoksa: "Premium/Pro paketi bulunamadı" hatası
- Eğer her şey hazırsa: Google Play satın alma ekranı açılmalı

### 5. Test Satın Alma:
- Test Google Play hesabıyla satın alma yap
- Sandbox modda gerçek para çekilmez
- Başarılı olursa: Plan güncellenecek, reklamlar kapanacak

---

## 🔧 Hızlı Kontrol Listesi

### Kod Hazır mı?
- [x] ✅ RevenueCat entegrasyonu (`usePurchases.tsx`)
- [x] ✅ Settings sayfası upgrade butonları
- [x] ✅ Error handling
- [x] ✅ Loading states
- [x] ✅ Toast notifications

### RevenueCat Dashboard Hazır mı?
- [ ] ❓ Products oluşturuldu mu? (`premium_monthly`, `pro_monthly`)
- [ ] ❓ Entitlements oluşturuldu mu? (`premium`, `pro`)
- [ ] ❓ Offerings oluşturuldu mu? (`default` offering)
- [ ] ❓ Packages eklenmiş mi? (`premium_monthly`, `pro_monthly`)

### Platform Hazır mı?
- [x] ✅ Android platformu mevcut
- [ ] ❌ iOS platformu eklenmemiş
- [ ] ⚠️ Production API keys eklenmemiş (test key kullanılıyor)

---

**Sonraki Adım:** RevenueCat Dashboard'da offerings ve packages oluşturmak!

