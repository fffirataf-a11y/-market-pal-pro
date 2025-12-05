# AdMob Kurulum - Adım Adım Rehber

## ✅ Adım 1: ID'ler Güncellendi (TAMAMLANDI)

- ✅ iOS App ID: `ca-app-pub-3272601063768123~1569350116`
- ✅ Android App ID: `ca-app-pub-3272601063768123~7349673296`
- ✅ iOS Ad Unit ID'leri güncellendi
- ✅ Android Ad Unit ID'leri güncellendi

---

## 📋 Adım 2: Capacitor Sync (ŞİMDİ YAPILACAK)

Native projelerinize plugin'leri eklemek için:

```bash
npm run cap:sync
```

Bu komut:
- AdMob plugin'ini iOS ve Android projelerine ekler
- Capacitor config'deki App ID'leri native projelere kopyalar
- Gerekli native bağımlılıkları yükler

**Yapılacak:** Terminal'de `npm run cap:sync` komutunu çalıştırın.

---

## 📱 Adım 3: Rewarded Ad Unit'leri Oluşturma

### iOS için Rewarded Ad Unit

1. AdMob Console'da **"Uygulamalar"** > **"Reklam birimleri"** sekmesine gidin
2. **"SmartMarket"** (iOS) uygulamasını seçin
3. **"+ Reklam birimi ekle"** butonuna tıklayın
4. **"Ödüllü"** (Rewarded) ad formatını seçin
5. Ad unit adı: **"Rewarded_Odullu"** (veya istediğiniz isim)
6. **"Ad unit ekle"** butonuna tıklayın
7. **iOS Rewarded Ad Unit ID'yi kopyalayın**

### Android için Rewarded Ad Unit

1. AdMob Console'da **"Uygulamalar"** > **"Reklam birimleri"** sekmesine gidin
2. **"SmartMarket"** (Android) uygulamasını seçin
3. **"+ Reklam birimi ekle"** butonuna tıklayın
4. **"Ödüllü"** (Rewarded) ad formatını seçin
5. Ad unit adı: **"Rewarded_Odullu"** (veya istediğiniz isim)
6. **"Ad unit ekle"** butonuna tıklayın
7. **Android Rewarded Ad Unit ID'yi kopyalayın**

**Yapılacak:** Rewarded ad unit'leri oluşturup ID'lerini paylaşın, ben güncelleyeceğim.

---

## 🔗 Adım 4: Mediation Group Yapılandırması

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

### Mediation Group'u Ad Unit'lere Bağlama

1. Oluşturduğunuz mediation group'a tıklayın
2. **"Ad units"** sekmesine gidin
3. **"+ Ad unit ekle"** butonuna tıklayın
4. Oluşturduğunuz ad unit'lerinizi seçin:
   - Banner (iOS ve Android)
   - Interstitial (iOS ve Android)
   - App Open (iOS ve Android)
   - Rewarded (iOS ve Android) - oluşturduktan sonra
5. **"Kaydet"** butonuna tıklayın

**Yapılacak:** Mediation group oluşturup istediğiniz ağları ekleyin. Bu adım opsiyoneldir ama gelir optimizasyonu için önerilir.

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

**Şu an için:** Test modu aktif (`initializeForTesting: true`). Production'a geçerken `false` yapın.

---

## 📱 Adım 6: Native Projeleri Açma ve Test Etme

### iOS için

```bash
npm run cap:open:ios
```

Xcode'da:
1. Projeyi açın
2. Signing & Capabilities'de bundle identifier'ı kontrol edin
3. Test cihazınızı bağlayın
4. Run butonuna tıklayın

### Android için

```bash
npm run cap:open:android
```

Android Studio'da:
1. Projeyi açın
2. Gradle sync yapın
3. Test cihazınızı bağlayın veya emulator çalıştırın
4. Run butonuna tıklayın

**Yapılacak:** Uygulamayı test cihazınızda çalıştırıp reklamların göründüğünü kontrol edin.

---

## ✅ Adım 7: Component Entegrasyonları (Opsiyonel)

### Banner Ad'ı Sayfalara Ekleme

Banner ad'ı sayfalara eklemek için:

```tsx
import BannerAd from "@/components/ads/BannerAd";

// Sayfa içinde
<BannerAd />
```

**Önerilen yerler:**
- `/lists` sayfasının alt kısmında
- `/scanner` sayfasının alt kısmında
- `/ai-chef` sayfasının alt kısmında

### Interstitial Ad'ı Sayfa Geçişlerinde Gösterme

Interstitial ad'ı sayfa geçişlerinde göstermek için:

```tsx
import { showInterstitialAd } from "@/lib/adManager";
import { useSubscription } from "@/hooks/useSubscription";

const { plan } = useSubscription();

// Örnek: Liste oluşturduktan sonra
const handleCreateList = async () => {
  // Liste oluşturma işlemi
  await createList();
  
  // Interstitial ad göster (sadece free plan kullanıcılarına)
  await showInterstitialAd(plan);
};
```

**Önerilen yerler:**
- Liste oluşturduktan sonra
- Ürün taraması yaptıktan sonra
- AI Chef tarifi oluşturduktan sonra
- Sayfa geçişlerinde (örneğin 3-4 sayfa geçişinde bir)

---

## 📊 Özet Checklist

- [x] ✅ iOS App ID güncellendi
- [x] ✅ Android App ID güncellendi
- [x] ✅ iOS Ad Unit ID'leri güncellendi
- [x] ✅ Android Ad Unit ID'leri güncellendi
- [ ] ⏳ Capacitor sync yapılacak (`npm run cap:sync`)
- [ ] ⏳ iOS Rewarded ad unit oluşturulacak
- [ ] ⏳ Android Rewarded ad unit oluşturulacak
- [ ] ⏳ Mediation group oluşturulacak (opsiyonel)
- [ ] ⏳ Uygulama test edilecek
- [ ] ⏳ Banner ad sayfalara eklenecek (opsiyonel)
- [ ] ⏳ Interstitial ad sayfa geçişlerinde gösterilecek (opsiyonel)

---

## 🎯 Şimdi Ne Yapalım?

1. **İlk olarak:** `npm run cap:sync` komutunu çalıştırın
2. **Sonra:** Rewarded ad unit'leri oluşturun ve ID'lerini paylaşın
3. **Sonra:** Uygulamayı test edin

Her adımı tamamladıktan sonra bana haber verin, bir sonraki adıma geçelim! 🚀

