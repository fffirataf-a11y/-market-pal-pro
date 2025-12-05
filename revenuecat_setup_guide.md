# RevenueCat Canlı (Production) Kurulum Rehberi

Bu rehber, iOS ve Android uygulamalarınızı gerçek ödemeler için RevenueCat'e nasıl bağlayacağınızı adım adım anlatır.

## 1. Ön Hazırlıklar
- **RevenueCat Hesabı**: Bir hesabınızın ve projenizin oluşturulmuş olması gerekir.
- **Google Play Console Hesabı**: Android için.
- **App Store Connect Hesabı**: iOS için.

## 2. Android Kurulumu (Google Play Store)

### Adım 2.1: Servis Hesabı (Service Account) Kimlik Bilgilerini Alma
RevenueCat'in Google ile makbuzları doğrulayabilmesi için bir Servis Hesabına ihtiyacı vardır.

1.  **Google Play Console** > **Setup (Kurulum)** > **API access (API erişimi)** menüsüne gidin.
2.  **Create new service account (Yeni servis hesabı oluştur)** butonuna tıklayın.
3.  Açılan penceredeki **Google Cloud Platform** linkine tıklayın.
4.  **Create Service Account (Servis Hesabı Oluştur)** butonuna tıklayın.
    - **Name (İsim)**: `revenuecat-upload` (veya benzeri bir isim).
    - **Role (Rol)**: `Pub/Sub Admin` VE `Monitoring Viewer`. (Eğer listede varsa `RevenueCat Real-time Developer Notifications` önerilir, yoksa bildirimler için `Pub/Sub Admin` yeterlidir).
    - *Sadece makbuz doğrulama için:*
    - **Role**: `Service Account User` yeterli değildir. Play Console'da ayrıca yetki vermeniz gerekir.
5.  **Anahtar (Key) Oluşturma**:
    - Oluşturduğunuz servis hesabına tıklayın > **Keys (Anahtarlar)** > **Add Key (Anahtar Ekle)** > **Create new key (Yeni anahtar oluştur)** > **JSON** seçeneğini seçin.
    - İndirilen bu dosyayı saklayın!

### Adım 2.2: Play Console'da Erişim Verme
1.  Tekrar **Google Play Console** > **API access** sayfasına dönün, yeni oluşturduğunuz servis hesabını bulun.
2.  **Grant Access (Erişim Ver)** butonuna tıklayın.
3.  **Hesap izinleri (Account permissions)**:
    - `View app information and download bulk reports` (Uygulama bilgilerini görüntüle...)
    - `View financial data, orders, and cancellation survey responses` (Finansal verileri görüntüle...)
    - `Manage orders and subscriptions` (Siparişleri ve abonelikleri yönet)
4.  **Uygulama izinleri (App permissions)**: Uygulamanızı seçin (`com.lionx.smartmarket`).
5.  **Invite User (Kullanıcıyı Davet Et)** butonuna tıklayın.

### Adım 2.3: RevenueCat Yapılandırması
1.  **RevenueCat Dashboard** > **Project Settings** > **Apps** > **Android** yolunu izleyin.
2.  **Package Name**: `com.lionx.smartmarket` olduğundan emin olun.
3.  **Service Account Credentials JSON**: Adım 2.1'de indirdiğiniz JSON dosyasını buraya yükleyin.
4.  **Save (Kaydet)** butonuna tıklayın.

## 3. iOS Kurulumu (App Store)

### Adım 3.1: App Store Connect Paylaşılan Sır (Shared Secret) - KESİN ÇÖZÜM
Eğer Abonelikler sayfasında bulamadıysanız, kesinlikle buradadır:

1.  **App Store Connect** ana ekranına dönün ve uygulamanıza tekrar tıklayın.
2.  Sol menüde **"General" (Genel)** başlığı altında **"App Information" (Uygulama Bilgileri)** sekmesine tıklayın.
3.  Açılan sayfanın **en altına kadar inin**.
4.  Orada **"App-Specific Shared Secret"** başlığını göreceksiniz.
5.  Yanındaki **"Manage" (Yönet)** yazısına tıklayın.
6.  Açılan pencerede kodunuzu göreceksiniz. Kopyalayın.

*Not: Bu kod, uygulamanızın tüm abonelik işlemleri için ana anahtardır.*

### Adım 3.2: RevenueCat Yapılandırması
1.  **RevenueCat Dashboard** > **Project Settings** > **Apps** > **iOS** yolunu izleyin.
2.  **Bundle ID**: `com.lionx.smartmarket` olduğundan emin olun.
3.  **App Store Connect Shared Secret**: Adım 3.1'de kopyaladığınız sırrı buraya yapıştırın.
4.  **Save (Kaydet)** butonuna tıklayın.

### Adım 3.3: App Store Connect API Anahtarı (Opsiyonel ama Önerilir)
Daha hızlı güncellemeler ve başlangıç teklifi uygunluk kontrolleri için gereklidir.
1.  **App Store Connect** > **Users and Access (Kullanıcılar ve Erişim)** > **Integrations (Entegrasyonlar)** > **In-App Purchase**.
2.  Bir API Anahtarı oluşturun.
3.  `.p8` dosyasını indirin.
4.  RevenueCat'te **iOS Configuration** altına yükleyin.

## 4. Ürün Yapılandırması (Product Configuration)
RevenueCat **Entitlements** ve **Offerings** ayarlarınızın uygulamadaki kodla eşleştiğinden emin olun:

- **Entitlements (Yetkiler)**:
    - `pro`
    - `premium`
- **Offerings** (Varsayılan Offering):
    - Package: `premium_monthly` -> Product: (Store'daki Ürün Kimliğiniz, örn: `com.lionx.smartmarket.premium_monthly`)
    - Package: `premium_yearly` -> Product: (Store'daki Ürün Kimliğiniz)
    - Package: `pro_monthly` -> Product: (Store'daki Ürün Kimliğiniz)
    - Package: `pro_yearly` -> Product: (Store'daki Ürün Kimliğiniz)

## 5. Test Etme
- **iOS**: **TestFlight** kullanın. Sandbox kullanıcıları otomatik oluşturulur.
- **Android**: **Internal Testing (Dahili Test)** kanalını kullanın. E-posta adresinizi Play Console'da "License Testers" (Lisans Test Kullanıcıları) kısmına ekleyerek ücretsiz test edebilirsiniz.

## 6. Son Kontrol
- `src/hooks/usePurchases.tsx` dosyasındaki API anahtarlarının RevenueCat'teki **Public API Keys** (Settings > API Keys) ile aynı olduğunu doğrulayın.
    - `ios`: `appl_...`
    - `android`: `goog_...`
