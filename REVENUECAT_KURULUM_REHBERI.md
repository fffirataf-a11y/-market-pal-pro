# RevenueCat Kurulum ve Yapılandırma Yönergesi

Ekran görüntülerinizi ve kodunuzu inceledim. RevenueCat panelinde (dashboard) yapmanız gereken işlemleri adım adım aşağıda özetledim.

## 1. API Anahtarlarını (API Keys) Alma
Ekran görüntünüzde gördüğünüz **"SDK API keys"** başlığı altındaki anahtarlar, aradığımız "Public API Key"lerdir. Ancak şu an sadece "Test Store" var. Gerçek market anahtarlarını oluşturmak için:

1.  RevenueCat panelinde sol menüden **Apps & providers** kısmına tıklayın.
    *   *Dikkat:* Eğer doğrudan "Test Store" detayları açılırsa, sayfanın en üstündeki (breadcrumb) **Apps & providers** yazısına tıklayarak ana listeye dönün.
2.  Ana listede sağ tarafta veya ortada **+ New** (veya **Add App**) butonunu göreceksiniz.
3.  Bu butona tıklayıp:
    *   **App Store (iOS)** seçin -> Bundle ID: `com.lionx.smartmarket` girin.
    *   **Play Store (Android)** seçin -> Package Name: `com.lionx.smartmarket` girin.
4.  Uygulamaları ekledikten sonra tekrar **API Keys** sayfasına dönün.
5.  **SDK API keys** tablosunda yeni satırlar göreceksiniz:
    *   `Android` için olan anahtar (genellikle `goog_` ile başlar).
    *   `iOS` için olan anahtar (genellikle `appl_` ile başlar).
6.  *Bu anahtarları `usePurchases.tsx` dosyasına ekleyeceğiz.*

## 2. Google Play Store Bağlantısı (Service Account Setup) [ÖNEMLİ]

Google Play Store'u RevenueCat'e bağlamak için bir **Service Account JSON** dosyasına ihtiyacınız var. Bu adım biraz karmaşıktır, lütfen dikkatlice takip edin:

### Adım A: Google Cloud Console İşlemleri
1.  [Google Cloud Console](https://console.cloud.google.com/) adresine gidin.
2.  Sol üstten projenizi seçin (Google Play Console'a bağlı olan proje).
3.  Sol menüden **IAM & Admin** > **Service Accounts** seçeneğine gidin.
4.  **+ CREATE SERVICE ACCOUNT** butonuna tıklayın.
    *   **Name:** `revenuecat-upload` (veya benzeri bir isim).
    *   **Create and Continue** deyin.
    *   **Role:** Şu anlık boş bırakabilirsiniz veya `Pub/Sub Admin` verebilirsiniz (fatura verilerini anlık almak için gereklidir ama kurulum için şart değil).
    *   **Done** diyerek bitirin.
5.  Oluşturduğunuz hesabın (listede görünür) sağındaki üç noktaya tıklayın -> **Manage keys**.
6.  **ADD KEY** -> **Create new key** seçin.
7.  **JSON** seçili olsun -> **Create** butonuna basın.
8.  Bilgisayarınıza bir `.json` dosyası inecek. **Bu dosyayı kaybetmeyin!**

### Adım B: Google Play Console Yetkilendirmesi
1.  [Google Play Console](https://play.google.com/console/) adresine gidin.
2.  Sol menüden **Users and permissions** (Kullanıcılar ve izinler) sayfasına gidin.
3.  **Invite new users** (Yeni kullanıcı davet et) butonuna basın.
4.  **Email address** kısmına: Az önce oluşturduğunuz Service Account'un email adresini yapıştırın (Cloud Console'da `revenuecat-upload@...` şeklinde yazar).
5.  **App permissions** sekmesinde: **Add app** diyip uygulamanızı (`SmartMarket`) seçin ve **Apply** deyin.
6.  **Account permissions** sekmesinde şu yetkileri işaretleyin:
    *   `View app information and download bulk reports` (Salt okunur)
    *   `View financial data, orders, and cancellation survey responses` (Finansal verileri gör)
    *   `Manage orders and subscriptions` (Siparişleri ve abonelikleri yönet)
7.  **Invite user** diyerek işlemi tamamlayın.

### Adım C: RevenueCat'e JSON Yükleme
1.  RevenueCat paneline dönün.
2.  **Apps & providers** sayfasından Android uygulamanızı seçin.
3.  **Service Account credentials JSON** kısmına, Adım A'da indirdiğiniz `.json` dosyasını yükleyin.
4.  **Save changes** diyerek kaydedin.
    *   *Eğer "Credentials valid" derse işlem tamamdır!*

## 3. Ürünlerin (Products) Eklenmesi

Sol menüden **Products** sayfasına gidin.

**Play Store (Android) İçin:**
Google Play'in yeni sisteminde ID'ler otomatik oluşabilir (örn: `premium:monthly`). **Bu sorun değil!** Şu adımları izleyin:

1.  **+ New** butonuna basın.
2.  **Subscription** kutusuna: `premium` yazın.
3.  **Base plan Id** kutusuna: `monthly` yazın.
4.  *RevenueCat product identifier* otomatik olarak `premium:monthly` olacaktır. **Buna dokunmayın, böyle kalsın.**
5.  Aynı işlemi diğerleri için de yapın:
    *   `premium` + `yearly` -> `premium:yearly`
    *   `pro` + `monthly` -> `pro:monthly`
    *   `pro` + `yearly` -> `pro:yearly`

## 4. Entitlements (Yetkiler) Oluşturma
1.  Sol menüden **Entitlements** sayfasına gidin.
2.  **+ New** diyerek iki yetki oluşturun:
    *   Identifier: `premium` -> İçine `premium_monthly` (iOS) ve `premium:monthly` (Android) ürünlerini ekleyin.
    *   Identifier: `pro` -> İçine `pro_monthly` (iOS) ve `pro:monthly` (Android) ürünlerini ekleyin.

## 5. Offerings (Paketler) Oluşturma (EN ÖNEMLİ KISIM)
Kodumuzun çalışması için **Paket İsimlerinin (Package Identifier)** kodla birebir aynı olması gerekir.

1.  Sol menüden **Offerings** sayfasına gidin.
2.  **Default** adında bir offering oluşturun (veya varsa içine girin).
3.  **+ New Package** diyerek şu paketleri oluşturun:

| Package Identifier (KOD İÇİN BU ŞART) | Description | İçine Konacak Ürünler |
| :--- | :--- | :--- |
| **`premium_monthly`** | Monthly Premium | iOS: `premium_monthly`<br>Android: `premium:monthly` |
| **`premium_yearly`** | Yearly Premium | iOS: `premium_yearly`<br>Android: `premium:yearly` |
| **`pro_monthly`** | Monthly Pro | iOS: `pro_monthly`<br>Android: `pro:monthly` |
| **`pro_yearly`** | Yearly Pro | iOS: `pro_yearly`<br>Android: `pro:yearly` |

> **Özet:** Android ürün ID'si `premium:monthly` olsa bile, onu `premium_monthly` isimli pakete koyduğumuz için kodumuz sorunsuz çalışacaktır.
