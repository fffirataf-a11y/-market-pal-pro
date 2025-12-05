# 🛒 RevenueCat'te Planları Oluşturma - Adım Adım Rehber

## 📍 Şu Anki Durumunuz
- ✅ **Offerings** sekmesindesiniz
- ✅ `default` adında bir offering var (2 package içeriyor)
- ⚠️ Products ve Entitlements'ı kontrol etmemiz gerekiyor

---

## 🎯 Adım 1: Products Oluşturma (Ürünler)

### 1.1 Products Sekmesine Git
1. Üst menüde **"Products"** sekmesine tıkla
2. Eğer hiç product yoksa boş liste göreceksiniz

### 1.2 Premium Monthly Product Oluştur

1. **"+ New product"** butonuna tıkla

2. **Product Details** formunu doldur:
   - **Product ID:** `premium_monthly` (⚠️ Bu isim önemli - kodda bu isim kullanılıyor)
   - **Product Type:** `Subscription` seç
   - **Duration:** `1 Month` seç
   - **Description:** "Premium Monthly Subscription" (opsiyonel)
   - **Store:** 
     - **Google Play:** Ürünü şimdilik "Add later" bırakabilirsiniz (test için)
     - **App Store:** Ürünü şimdilik "Add later" bırakabilirsiniz (test için)
   
3. **"Create product"** butonuna tıkla

### 1.3 Pro Monthly Product Oluştur

1. Tekrar **"+ New product"** butonuna tıkla

2. **Product Details** formunu doldur:
   - **Product ID:** `pro_monthly` (⚠️ Bu isim önemli - kodda bu isim kullanılıyor)
   - **Product Type:** `Subscription` seç
   - **Duration:** `1 Month` seç
   - **Description:** "Pro Monthly Subscription" (opsiyonel)
   - **Store:** 
     - **Google Play:** Ürünü şimdilik "Add later" bırakabilirsiniz
     - **App Store:** Ürünü şimdilik "Add later" bırakabilirsiniz
   
3. **"Create product"** butonuna tıkla

### ✅ Kontrol:
Products sekmesinde şunlar olmalı:
- `premium_monthly` (Subscription - 1 Month)
- `pro_monthly` (Subscription - 1 Month)

---

## 🎯 Adım 2: Entitlements Oluşturma (Yetkilendirmeler)

### 2.1 Entitlements Sekmesine Git
1. Üst menüde **"Entitlements"** sekmesine tıkla
2. Eğer hiç entitlement yoksa boş liste göreceksiniz

### 2.2 Premium Entitlement Oluştur

1. **"+ New entitlement"** butonuna tıkla

2. **Entitlement Details** formunu doldur:
   - **Identifier:** `premium` (⚠️ Bu isim önemli - kodda bu isim kullanılıyor)
   - **Display name:** "Premium Plan" (opsiyonel)
   - **Description:** "Premium subscription features" (opsiyonel)
   
3. **"Create entitlement"** butonuna tıkla

4. **Product Ekleme:**
   - Açılan sayfada **"Add product"** butonuna tıkla
   - `premium_monthly` product'ını seç
   - **"Add"** butonuna tıkla

### 2.3 Pro Entitlement Oluştur

1. Tekrar **"+ New entitlement"** butonuna tıkla

2. **Entitlement Details** formunu doldur:
   - **Identifier:** `pro` (⚠️ Bu isim önemli - kodda bu isim kullanılıyor)
   - **Display name:** "Pro Plan" (opsiyonel)
   - **Description:** "Pro subscription features" (opsiyonel)
   
3. **"Create entitlement"** butonuna tıkla

4. **Product Ekleme:**
   - Açılan sayfada **"Add product"** butonuna tıkla
   - `pro_monthly` product'ını seç
   - **"Add"** butonuna tıkla

### ✅ Kontrol:
Entitlements sekmesinde şunlar olmalı:
- `premium` → `premium_monthly` product'ı eklenmiş
- `pro` → `pro_monthly` product'ı eklenmiş

---

## 🎯 Adım 3: Offerings'i Güncelleme (Mevcut "default" Offering)

### 3.1 Offerings Sekmesine Geri Dön
1. Üst menüde **"Offerings"** sekmesine tıkla
2. `default` offering'in üzerine tıkla (veya yanındaki "..." menüsünden "Edit" seç)

### 3.2 Packages Kontrol Et ve Düzenle

1. **"default" offering'i açın**

2. **Packages** bölümünü kontrol edin:
   - Mevcut 2 package'ın ne olduğunu görün
   - Eğer `premium_monthly` ve `pro_monthly` yoksa, ekleyin

### 3.3 Package Ekleme/Düzenleme

#### Eğer Packages Yoksa veya Yanlışsa:

1. **"Add package"** veya **"+ Package"** butonuna tıkla

2. **Package Oluştur - Premium:**
   - **Identifier:** `premium_monthly` (⚠️ Bu isim önemli!)
   - **Product:** `premium_monthly` seç (yukarıda oluşturduğumuz product)
   - **Paywall template:** Herhangi birini seçebilirsiniz (veya "None")
   - **Save** veya **Add** butonuna tıkla

3. **Package Oluştur - Pro:**
   - **"Add package"** butonuna tekrar tıkla
   - **Identifier:** `pro_monthly` (⚠️ Bu isim önemli!)
   - **Product:** `pro_monthly` seç
   - **Paywall template:** Herhangi birini seçebilirsiniz (veya "None")
   - **Save** veya **Add** butonuna tıkla

#### Eğer Mevcut Packages Varsa:

1. Her package'ın üzerine tıklayın
2. **Identifier** kontrol edin:
   - Biri `premium_monthly` olmalı
   - Biri `pro_monthly` olmalı
3. Eğer farklıysa, **"Edit"** butonuna tıklayıp identifier'ı düzeltin
4. **Product** kontrol edin:
   - `premium_monthly` package'ı → `premium_monthly` product'ı göstermeli
   - `pro_monthly` package'ı → `pro_monthly` product'ı göstermeli

### 3.4 Offering'i Aktif Hale Getir

1. Offering detay sayfasında
2. Eğer **"Set as current"** veya **"Make current offering"** butonu varsa, ona tıklayın
3. Bu, `default` offering'in kodda `offerings.current` olarak dönebilmesi için gerekli

### ✅ Kontrol:
Offerings sekmesinde:
- `default` offering içinde:
  - Package: `premium_monthly` → Product: `premium_monthly`
  - Package: `pro_monthly` → Product: `pro_monthly`
- Offering "current" olarak işaretlenmiş olmalı

---

## 🎯 Adım 4: Test Etme

### 4.1 Kodda Beklenen Değerler

Kodunuz şunları bekliyor:
```typescript
// usePurchases.tsx içinde:
offerings.current.availablePackages.find(
  (pkg) => pkg.identifier === 'premium_monthly'  // ✅ Bu package bulunmalı
)

offerings.current.availablePackages.find(
  (pkg) => pkg.identifier === 'pro_monthly'  // ✅ Bu package bulunmalı
)
```

### 4.2 Android'de Test

1. Uygulamayı telefonda çalıştırın
2. Settings sayfasına gidin
3. **RevenueCat Status** kartını kontrol edin (yeni eklediğimiz debug kartı)
4. Logları kontrol edin:
   ```bash
   adb logcat | findstr "RevenueCat"
   ```
   
**Beklenen Loglar:**
```
✅ RevenueCat initialized successfully
📦 Available offerings: {...}
✅ Premium plan package found: premium_monthly
✅ Pro plan package found: pro_monthly
```

**Eğer Package Bulunamazsa:**
```
⚠️ Premium plan package (premium_monthly) not found
⚠️ Pro plan package (pro_monthly) not found
```

### 4.3 Test Satın Alma

1. Settings → Subscription Plans
2. Premium veya Pro plan seçin
3. **Upgrade** butonuna basın
4. Eğer her şey doğruysa, Google Play satın alma ekranı açılmalı
5. Test hesabıyla satın alma yapabilirsiniz (sandbox modda gerçek para çekilmez)

---

## ❗ Önemli Notlar

### Identifier'lar Önemli!
- Product ID: `premium_monthly`, `pro_monthly`
- Entitlement ID: `premium`, `pro`
- Package ID: `premium_monthly`, `pro_monthly`

**⚠️ Bu isimler kodunuzda kullanılıyor, tam olarak aynı olmalılar!**

### Store Bağlantısı
- Şimdilik Google Play ve App Store ürünlerini "Add later" bırakabilirsiniz
- Test için RevenueCat'in test modu kullanılacak
- Production'a geçerken gerçek store ürünlerini bağlamanız gerekecek

### Current Offering
- `default` offering'in "current" olarak işaretlenmiş olması önemli
- Kod `offerings.current` kullanıyor

---

## 🐛 Olası Sorunlar

### "Ürün bulunamadı" Hatası
- **Sebep:** Offerings'de `default` offering yok veya current değil
- **Çözüm:** Offerings sekmesinde `default` offering'i "current" yapın

### "Package not found" Hatası
- **Sebep:** Package identifier'ları yanlış (`premium_monthly`, `pro_monthly` olmalı)
- **Çözüm:** Offerings → default → Packages → Identifier'ları kontrol edin

### "Premium/Pro paketi bulunamadı" Hatası
- **Sebep:** Package'lar offerings'e eklenmemiş
- **Çözüm:** Offerings → default → Add package → `premium_monthly` ve `pro_monthly` ekleyin

---

## ✅ Kontrol Listesi

Yapılandırmadan sonra şunlar olmalı:

### Products:
- [ ] `premium_monthly` (Subscription - 1 Month)
- [ ] `pro_monthly` (Subscription - 1 Month)

### Entitlements:
- [ ] `premium` → `premium_monthly` product'ı eklenmiş
- [ ] `pro` → `pro_monthly` product'ı eklenmiş

### Offerings:
- [ ] `default` offering mevcut ve "current" olarak işaretlenmiş
- [ ] Package: `premium_monthly` → Product: `premium_monthly`
- [ ] Package: `pro_monthly` → Product: `pro_monthly`

---

**Hazır olduğunuzda, Android'de test edebiliriz! 🚀**

