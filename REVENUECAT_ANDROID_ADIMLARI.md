# RevenueCat Android Kurulum Adımları

Bu rehber, uygulamanızın Android versiyonu için ödeme sistemini (RevenueCat) nasıl yapılandıracağınızı adım adım anlatır. Android kurulumu iOS'e göre biraz daha fazla ayar gerektirir (özellikle Google Cloud Service Account kısmı).

## 1. Google Play Console İşlemleri

1.  [Google Play Console](https://play.google.com/console/) adresine gidin.
2.  **Uygulama Oluştur** diyerek uygulamanızı oluşturun (Eğer yoksa).
    *   **Uygulama Adı:** SmartMarket
    *   **Varsayılan Dil:** Türkçe veya İngilizce
    *   **Uygulama Türü:** Uygulama
    *   **Ücret Durumu:** Ücretsiz (İçinde satın alma olacak)
3.  Uygulamanın içine girin ve en altta **Para Kazanma** > **Ürünler** > **Abonelikler** kısmına gidin.
4.  **Abonelik Oluştur** diyerek ürünlerinizi oluşturun:

| Ürün Kimliği (Product ID) | Adı | Süre |
| :--- | :--- | :--- |
| `premium` | Premium Plan | (İçine Base Plan ekleyerek ayarlanır) |
| `pro` | Pro Plan | (İçine Base Plan ekleyerek ayarlanır) |

**ÖNEMLİ:** Google Play'in yeni yapısında "Abonelik" bir kap gibidir. İçine "Temel Planlar" (Base Plans) eklersiniz.
*   `premium` aboneliğinin içine:
    *   `monthly` ID'li, 1 aylık, otomatik yenilenen bir plan ekleyin. (RevenueCat ID'si: `premium:monthly` olur)
    *   `yearly` ID'li, 1 yıllık, otomatik yenilenen bir plan ekleyin. (RevenueCat ID'si: `premium:yearly` olur)
*   `pro` aboneliğinin içine de aynı şekilde `monthly` ve `yearly` planlarını ekleyin.

## 2. Google Cloud Service Account Kurulumu (Zorunlu)

RevenueCat'in Google Play ile konuşabilmesi için bu adım şarttır.

1.  [Google Cloud Console](https://console.cloud.google.com/) adresine gidin.
2.  Google Play Console hesabınızın bağlı olduğu projeyi seçin (Genelde "Google Play Android Developer" diye geçer veya yeni proje oluşturun).
3.  Sol menüden **IAM & Admin** > **Service Accounts** seçin.
4.  **+ Create Service Account** deyin.
    *   **Name:** `revenuecat-access`
    *   **Create and Continue**
    *   **Role:** `Pub/Sub Admin` (Gerçek zamanlı bildirimler için) ve `Monitoring Viewer`.
    *   **Done**.
5.  Oluşturulan hesabın sağındaki üç noktaya basın > **Manage Keys**.
6.  **Add Key** > **Create new key** > **JSON** seçin ve dosyayı indirin. **Bu dosyayı saklayın!**

## 3. Google Play Console Yetkilendirmesi

1.  Google Play Console'a dönün.
2.  Sol menüden **Users and permissions** (Kullanıcılar ve izinler) sayfasına gidin.
3.  **Invite new users** deyin.
4.  **Email:** Az önce oluşturduğunuz Service Account'un email adresini (`revenuecat-access@...` gibi) yapıştırın.
5.  **App permissions:** Uygulamanızı seçin ve **Apply** deyin.
6.  **Account permissions:** Şu yetkileri verin:
    *   `View app information and download bulk reports`
    *   `View financial data`
    *   `Manage orders and subscriptions`
7.  **Invite User** diyerek tamamlayın.

## 4. RevenueCat Paneli İşlemleri

1.  [RevenueCat Dashboard](https://app.revenuecat.com/) adresine gidin.
2.  Projenizi seçin > **Apps** > **+ New** > **Play Store**.
    *   **App Name:** SmartMarket Android
    *   **Google Play Package:** `com.lionx.smartmarket`
    *   **Service Account credentials JSON:** İndirdiğiniz JSON dosyasını buraya yükleyin.
    *   **Save Changes**.
    *   *Eğer "Credentials valid" derse bağlantı başarılıdır.*

## 5. Ürünleri Entitlement'lara Bağlama (Sizde Eksik Olan Kısım)

Ekran görüntüsünde gördüğümüz "Attach" butonlarını halledelim.

1.  RevenueCat panelinde **Entitlements** sayfasına gidin.
2.  `premium` entitlement'ına tıklayın.
3.  **Attach** butonuna basın ve Android ürünlerini (`premium:monthly`, `premium:yearly`) seçip ekleyin.
4.  `pro` entitlement'ına tıklayın.
5.  **Attach** butonuna basın ve Android ürünlerini (`pro:monthly`, `pro:yearly`) seçip ekleyin.

## 6. API Anahtarını Alma

1.  **API Keys** sayfasına gidin.
2.  **Android** için olan Public API Key'i (`goog_` ile başlar) kopyalayın.
3.  Bana iletin veya `src/hooks/usePurchases.tsx` dosyasına ekleyin.

## 7. Test Etme

Android testi Windows'ta çok kolaydır.
1.  Android Studio'nun kurulu olduğundan emin olun.
2.  Telefonunuzu USB ile bağlayın (Geliştirici seçenekleri ve USB hata ayıklama açık olsun).
3.  Terminalde: `npx cap run android` komutunu çalıştırın.
4.  Uygulama telefona yüklenecektir.

> **Not:** Google Play'de "Dahili Test" (Internal Testing) kanalına bir APK yüklemeden ve test kullanıcısı eklemeden satın alma çalışmayabilir. İlk seferde "Item not found" hatası alırsanız, Google Play Console'da Internal Testing sürümü oluşturup kendi emailinizi testçi olarak eklemeniz gerekir.
