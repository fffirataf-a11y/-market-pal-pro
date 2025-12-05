# AdMob Kurulum - Yapılacaklar Listesi

## ✅ Tamamlananlar

1. ✅ AdMob Capacitor plugin kuruldu
2. ✅ adManager.ts dosyasına Banner, Interstitial ve App Open fonksiyonları eklendi
3. ✅ Tüm reklam fonksiyonlarına plan kontrolü eklendi (sadece free plan kullanıcıları reklam görebilir)
4. ✅ iOS Ad Unit ID'leri güncellendi:
   - Banner: `ca-app-pub-3272601063768123/5295066039`
   - Interstitial: `ca-app-pub-3272601063768123/6643096287`
   - App Open: `ca-app-pub-3272601063768123/8718595284`
5. ✅ BannerAd component'i oluşturuldu
6. ✅ RewardedAdSlot component'i güncellendi (plan parametresi eklendi)
7. ✅ App Open ad App.tsx'e entegre edildi

## ⏳ Bekleyen İşlemler

### 1. iOS App ID Güncelleme
- [ ] AdMob Console'dan iOS App ID'yi alın
- [ ] `src/lib/adManager.ts` dosyasında `ADMOB_APP_IDS.ios` değerini güncelleyin
- [ ] `capacitor.config.json` dosyasında iOS App ID'yi güncelleyin

### 2. Android Kurulumu
- [ ] AdMob Console'da Android uygulaması oluşturun
- [ ] Android için ad unit'ler oluşturun (Banner, Interstitial, App Open, Rewarded)
- [ ] Android App ID'yi alın
- [ ] Android Ad Unit ID'lerini alın
- [ ] `src/lib/adManager.ts` dosyasında Android ID'leri güncelleyin:
  - `ADMOB_APP_IDS.android`
  - `ANDROID_AD_UNIT_IDS.banner`
  - `ANDROID_AD_UNIT_IDS.interstitial`
  - `ANDROID_AD_UNIT_IDS.appOpen`
  - `ANDROID_AD_UNIT_IDS.rewarded`
- [ ] `capacitor.config.json` dosyasında Android App ID'yi güncelleyin

### 3. Rewarded Ad Unit Oluşturma
- [ ] iOS için Rewarded ad unit oluşturun
- [ ] Android için Rewarded ad unit oluşturun
- [ ] `src/lib/adManager.ts` dosyasında Rewarded ad unit ID'lerini güncelleyin

### 4. Mediation Group Yapılandırması
- [ ] AdMob Console'da Mediation group oluşturun
- [ ] İstediğiniz reklam ağlarını ekleyin (Meta Ads, Unity Ads, AppLovin, vb.)
- [ ] Mediation group'u ad unit'lere bağlayın

### 5. Component Entegrasyonları
- [ ] Banner ad'ı sayfalara ekleyin:
  - [ ] `/lists` sayfasına
  - [ ] `/scanner` sayfasına
  - [ ] `/ai-chef` sayfasına
- [ ] Interstitial ad'ı sayfa geçişlerinde gösterin:
  - [ ] Liste oluşturduktan sonra
  - [ ] Ürün taraması yaptıktan sonra
  - [ ] AI Chef tarifi oluşturduktan sonra

### 6. Test ve Production
- [ ] Test modunu kapatın (`initializeForTesting: false`)
- [ ] Test cihazlarınızı `testingDevices` array'ine ekleyin
- [ ] Uygulamayı test edin
- [ ] Production'a deploy edin

## 📝 Notlar

### Plan Kontrolü
Tüm reklam fonksiyonları otomatik olarak plan kontrolü yapar:
- ✅ **Free plan:** Tüm reklamlar gösterilir
- ❌ **Premium plan:** Hiçbir reklam gösterilmez
- ❌ **Pro plan:** Hiçbir reklam gösterilmez

### Reklam Türleri
1. **Banner:** Sayfa altında sürekli görünür (sadece free plan)
2. **Interstitial:** Sayfa geçişlerinde gösterilir (sadece free plan)
3. **App Open:** Uygulama açılışında gösterilir (sadece free plan)
4. **Rewarded:** Kullanıcı ödül için izler (sadece free plan)

### AdMob Mediation
Tüm reklamlar AdMob Mediation üzerinden çalışır. Mediation, en yüksek teklifi veren ağı otomatik olarak seçer.

## 🔗 Yararlı Linkler

- [AdMob Console](https://apps.admob.com/)
- [AdMob Mediation Dokümantasyonu](https://developers.google.com/admob/mediation)
- [Capacitor AdMob Plugin](https://github.com/capacitor-community/admob)

