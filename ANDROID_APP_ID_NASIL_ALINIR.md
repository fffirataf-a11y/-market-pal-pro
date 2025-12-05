# Android App ID Nasıl Alınır?

## 📱 Android App ID'yi Bulma

Android App ID'yi bulmak için şu adımları izleyin:

### Adım 1: AdMob Console'a Giriş
1. [AdMob Console](https://apps.admob.com/) adresine gidin
2. Google hesabınızla giriş yapın

### Adım 2: Uygulamalar Sekmesine Gidin
1. Sol menüden **"Uygulamalar"** (Apps) sekmesine tıklayın
2. **"SmartMarket"** uygulamasını bulun (Android ikonu olan)

### Adım 3: Android Uygulamasını Seçin
1. **"SmartMarket"** (Android) uygulamasına tıklayın
2. Uygulama detay sayfası açılacak

### Adım 4: App ID'yi Bulun
1. Uygulama detay sayfasında **"App ID"** veya **"Uygulama kimliği"** bölümünü bulun
2. App ID şu formatta olacak: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`
3. Bu ID'yi kopyalayın

### Alternatif Yol: Reklam Birimleri Sayfasından
1. Sol menüden **"Uygulamalar"** > **"Reklam birimleri"** (Ad units) sekmesine gidin
2. **"SmartMarket"** (Android) uygulamasını seçin
3. Sayfanın üst kısmında veya uygulama bilgilerinde App ID görünebilir

### Alternatif Yol: Uygulama Ayarları
1. Sol menüden **"Uygulamalar"** > **"Uygulama ayarları"** (App settings) sekmesine gidin
2. **"SmartMarket"** (Android) uygulamasını seçin
3. App ID burada görünecektir

## 📋 Örnek App ID Formatı

Android App ID genellikle şu formatta olur:
```
ca-app-pub-3272601063768123~XXXXXXXXXX
```

**Not:** `~` işaretinden önceki kısım (3272601063768123) Ad Unit ID'lerinizle aynı olmalı. `~` işaretinden sonraki kısım farklı olacaktır.

## ✅ App ID'yi Aldıktan Sonra

App ID'yi aldıktan sonra bana paylaşın, şu dosyaları güncelleyeceğim:
1. `src/lib/adManager.ts` → `ADMOB_APP_IDS.android`
2. `capacitor.config.json` → `AdMob.appId.android`

## 🔍 Hala Bulamıyorsanız

Eğer App ID'yi bulamıyorsanız:
1. AdMob Console'da **"Uygulamalar"** sekmesine gidin
2. Android uygulamanızın yanında **"Ayarlar"** (Settings) ikonuna tıklayın
3. Veya uygulama adına tıklayıp detay sayfasına gidin
4. App ID genellikle sayfanın üst kısmında veya "Uygulama bilgileri" bölümünde görünür

