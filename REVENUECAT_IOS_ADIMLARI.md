# RevenueCat iOS Kurulum Adımları

Bu rehber, uygulamanızın iOS versiyonu için ödeme sistemini (RevenueCat) nasıl yapılandıracağınızı adım adım anlatır.

## 1. App Store Connect İşlemleri

Öncelikle Apple'ın kendi panelinde uygulamanızı ve ürünlerinizi oluşturmalısınız.

1.  [App Store Connect](https://appstoreconnect.apple.com/) adresine gidin ve giriş yapın.
2.  **My Apps** bölümünden uygulamanızı oluşturun (Eğer henüz yoksa).
    *   **Bundle ID:** `com.lionx.smartmarket` (Bu ID'nin `capacitor.config.json` dosyasındaki ile aynı olduğundan emin olun).
3.  Uygulamanızın içine girin ve sol menüden **Subscriptions** (Abonelikler) kısmına gidin.
4.  **Subscription Group** oluşturun (Örn: "SmartMarket Plans").
5.  Bu grup içinde aşağıdaki **Product ID**'lere sahip abonelikleri oluşturun:

| Referans Adı (Sizin için) | Product ID (ÖNEMLİ) | Süre | Fiyat |
| :--- | :--- | :--- | :--- |
| Premium Monthly | `premium_monthly` | 1 Ay | Belirlediğiniz Fiyat |
| Premium Yearly | `premium_yearly` | 1 Yıl | Belirlediğiniz Fiyat |
| Pro Monthly | `pro_monthly` | 1 Ay | Belirlediğiniz Fiyat |
| Pro Yearly | `pro_yearly` | 1 Yıl | Belirlediğiniz Fiyat |

> **Not:** Product ID'leri `com.lionx.smartmarket.premium_monthly` şeklinde uzun da yapabilirsiniz, ancak RevenueCat'te eşleştirirken dikkatli olmalısınız. Tavsiyemiz basitlik için yukarıdaki gibi kısa tutmanızdır. Eğer Apple zorunlu tutarsa `com.lionx.smartmarket.premium_monthly` yapın.

6.  Her ürün için "App Store Localization" (Görünen Ad ve Açıklama) ve Fiyat bilgilerini doldurup kaydedin.
7.  **App Store Connect Shared Secret** anahtarını alın:
    *   Subscriptions sayfasında "App-Specific Shared Secret" kısmından bu anahtarı kopyalayın. RevenueCat'e lazım olacak.

## 2. RevenueCat Paneli İşlemleri

Şimdi RevenueCat'i iOS uygulamanızla bağlayacağız.

1.  [RevenueCat Dashboard](https://app.revenuecat.com/) adresine gidin.
2.  Projenizi seçin (veya yeni proje oluşturun).
3.  Sol menüden **Apps** (veya App Settings) kısmına gidin.
4.  **+ New** diyerek **App Store** uygulamasını seçin.
    *   **App Name:** SmartMarket iOS
    *   **Bundle ID:** `com.lionx.smartmarket`
    *   **App Store Connect Shared Secret:** Az önce kopyaladığınız anahtarı buraya yapıştırın.
    *   **Save Changes** deyin.

## 3. Ürünleri ve Paketleri Eşleştirme (Çok Önemli)

Kodumuzun çalışması için RevenueCat'teki "Package" isimlerinin kodla birebir aynı olması gerekir.

1.  Sol menüden **Products** kısmına gidin.
2.  **+ New** diyerek App Store Connect'te oluşturduğunuz ürünleri tek tek ekleyin:
    *   Identifier: `premium_monthly` (veya Apple'da ne yaptıysanız, örn: `com.lionx.smartmarket.premium_monthly`)
    *   Diğer 3 ürünü de ekleyin.
3.  Sol menüden **Entitlements** kısmına gidin.
    *   **+ New** diyerek `premium` adında bir entitlement oluşturun. İçine premium ürünlerini ekleyin.
    *   **+ New** diyerek `pro` adında bir entitlement oluşturun. İçine pro ürünlerini ekleyin.
4.  Sol menüden **Offerings** kısmına gidin.
    *   **Default** offering'e tıklayın (yoksa oluşturun).
    *   **Packages** bölümünde **+ New** diyerek aşağıdaki paketleri oluşturun. **Identifier kısımları kodla AYNI OLMALIDIR:**

| Package Identifier (Kodda Kullanılan) | Eşleştirilecek Ürün (Product) |
| :--- | :--- |
| `premium_monthly` | App Store'daki Premium Monthly ürünü |
| `premium_yearly` | App Store'daki Premium Yearly ürünü |
| `pro_monthly` | App Store'daki Pro Monthly ürünü |
| `pro_yearly` | App Store'daki Pro Yearly ürünü |

## 4. API Anahtarını Projeye Ekleme

1.  RevenueCat panelinde **API Keys** bölümüne gidin.
2.  **Public API Key** (iOS için olan, `appl_` ile başlar) anahtarını kopyalayın.
3.  Projenizde `src/hooks/usePurchases.tsx` dosyasını açın.
4.  `REVENUECAT_API_KEY` objesindeki `ios` kısmına bu anahtarı yapıştırın.

```typescript
const REVENUECAT_API_KEY = {
  ios: 'BURAYA_YENI_ANAHTARI_YAPISTIRIN', // appl_...
  android: '...',
};
```

## 5. Test Etme

iOS simülatöründe satın alma testi yapmak zordur. Gerçek bir iPhone cihazında test etmeniz önerilir.
1.  iPhone'unuzu bilgisayara bağlayın.
2.  `npx cap open ios` komutunu çalıştırın (Xcode açılacaktır).
3.  Xcode'da Signing & Capabilities kısmından Team seçin.
4.  Uygulamayı telefonunuza yükleyin (Play butonu).
5.  Ayarlar sayfasından paketleri görmeye çalışın.

> **Not:** App Store Connect'te "Agreements, Tax, and Banking" kısmındaki sözleşmelerin imzalanmış olması gerekir, yoksa ürünler gelmez.
