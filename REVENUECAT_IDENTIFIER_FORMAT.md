# RevenueCat Product Identifier Format Kuralları

## ✅ Doğru Format

Product identifier'lar için kurallar:
- **Sadece** şunlar kullanılabilir:
  - Harf: `a-z`, `A-Z`
  - Rakam: `0-9`
  - Nokta: `.`
  - Alt çizgi: `_`
- **Maksimum 100 karakter**

## ✅ Doğru Örnekler

```
premium_monthly    ✅ DOĞRU
premium_yearly     ✅ DOĞRU
pro_monthly        ✅ DOĞRU
pro_yearly         ✅ DOĞRU
premium.monthly    ✅ DOĞRU (nokta da olabilir)
pro_yearly_2024    ✅ DOĞRU
PremiumMonthly     ✅ DOĞRU (büyük harf olabilir)
```

## ❌ Yanlış Örnekler

```
premium-monthly    ❌ YANLIŞ (tire kullanılamaz)
premium yearly     ❌ YANLIŞ (boşluk kullanılamaz)
premium$monthly    ❌ YANLIŞ (özel karakter)
premium/monthly    ❌ YANLIŞ (slash kullanılamaz)
premium+monthly    ❌ YANLIŞ (artı işareti)
```

## 📝 Kodumuzda Kullanılan Identifier'lar

### Products:
- `premium_monthly` ✅
- `premium_yearly` ✅
- `pro_monthly` ✅
- `pro_yearly` ✅

### Entitlements:
- `premium` ✅
- `pro` ✅

### Packages (Offerings içinde):
- `premium_monthly` ✅
- `premium_yearly` ✅ (eklenecek)
- `pro_monthly` ✅
- `pro_yearly` ✅ (eklenecek)

---

**Kural:** Her zaman alt çizgi (`_`) kullanın, tire (`-`) kullanmayın!

