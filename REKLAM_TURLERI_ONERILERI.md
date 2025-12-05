# Reklam Türleri Önerileri - SmartMarket

## 📊 Mevcut Durum
- ✅ **Rewarded (Ödüllü)** - Zaten mevcut

## 🎯 Önerilen Reklam Türleri

### 1. **Banner** (Önerilen ⭐)
**Neden eklemeliyiz:**
- Sürekli görünür, pasif gelir sağlar
- Liste sayfalarının alt kısmında gösterilebilir
- Kullanıcı deneyimini çok bozmaz
- Düşük ama sürekli gelir

**Nerede gösterilebilir:**
- `/lists` sayfasının alt kısmında
- `/scanner` sayfasının alt kısmında
- `/ai-chef` sayfasının alt kısmında

**Gelir potansiyeli:** ⭐⭐⭐ (Orta)

---

### 2. **Interstitial (Geçiş)** (Önerilen ⭐⭐)
**Neden eklemeliyiz:**
- Yüksek gelir potansiyeli
- Doğal geçiş anlarında gösterilir
- Kullanıcı deneyimini fazla bozmaz

**Nerede gösterilebilir:**
- Liste oluşturduktan sonra
- Ürün taraması yaptıktan sonra
- AI Chef tarifi oluşturduktan sonra
- Sayfa geçişlerinde (örneğin 3-4 sayfa geçişinde bir)

**Gelir potansiyeli:** ⭐⭐⭐⭐⭐ (Çok Yüksek)

---

### 3. **App Open (Uygulama Açıkken)** (Önerilen ⭐⭐⭐)
**Neden eklemeliyiz:**
- Uygulama açılışında gösterilir
- Yüksek görünürlük
- Yüksek gelir potansiyeli
- Kullanıcı zaten uygulamayı açmış, beklentisi var

**Nerede gösterilebilir:**
- Uygulama her açıldığında (splash screen üzerinde)
- Uygulamaya dönüldüğünde

**Gelir potansiyeli:** ⭐⭐⭐⭐⭐ (Çok Yüksek)

**Not:** Günlük limit koymak iyi olur (örneğin günde 3-5 kez)

---

### 4. **Native Advanced (Yerel Gelişmiş)** (Opsiyonel)
**Neden eklemeliyiz:**
- Liste içeriğiyle uyumlu görünür
- Daha az rahatsız edici
- Orta gelir potansiyeli

**Nerede gösterilebilir:**
- Liste öğeleri arasında (örneğin her 5-10 öğede bir)
- AI Chef tarifleri arasında

**Gelir potansiyeli:** ⭐⭐⭐ (Orta)

**Not:** Daha karmaşık implementasyon gerektirir

---

## 💡 Önerilen Kombinasyon

### Seçenek 1: Maksimum Gelir (Önerilen)
- ✅ Rewarded (Zaten var)
- ✅ Banner
- ✅ Interstitial
- ✅ App Open

**Toplam gelir potansiyeli:** ⭐⭐⭐⭐⭐

### Seçenek 2: Dengeli Yaklaşım
- ✅ Rewarded (Zaten var)
- ✅ Banner
- ✅ Interstitial

**Toplam gelir potansiyeli:** ⭐⭐⭐⭐

### Seçenek 3: Minimal (Kullanıcı Dostu)
- ✅ Rewarded (Zaten var)
- ✅ Banner

**Toplam gelir potansiyeli:** ⭐⭐⭐

---

## 📍 Reklam Yerleşim Önerileri

### Banner Reklamlar
```
[Liste Sayfası]
┌─────────────────────┐
│  Liste Öğeleri      │
│  - Ürün 1           │
│  - Ürün 2           │
│  - Ürün 3           │
│                     │
│  [BANNER AD]        │ ← Buraya
└─────────────────────┘
```

### Interstitial Reklamlar
```
Kullanıcı işlemi tamamlar → Interstitial gösterilir → Sonraki sayfaya geçer
```

### App Open Reklamlar
```
Uygulama açılır → Splash Screen → App Open Ad → Ana sayfa
```

---

## ⚙️ Teknik Detaylar

### Banner Ad
- Otomatik yenilenebilir (30-60 saniye)
- Responsive (ekran boyutuna göre ayarlanır)
- Alt kısımda sabit konumlandırılabilir

### Interstitial Ad
- Önceden yüklenmeli (hızlı gösterim için)
- Sayfa geçişlerinde gösterilmeli
- Günlük limit koyulabilir (örneğin 5-10 kez)

### App Open Ad
- Uygulama açılışında gösterilmeli
- Günlük limit koyulmalı (örneğin 3-5 kez)
- Cold start ve warm start için ayrı yönetim

---

## 🎯 Sonuç

**En iyi kombinasyon:** Rewarded + Banner + Interstitial + App Open

Bu kombinasyon:
- ✅ Maksimum gelir sağlar
- ✅ Kullanıcı deneyimini dengeli tutar
- ✅ Farklı kullanım senaryolarını kapsar
- ✅ Pasif ve aktif gelir kaynakları sağlar

