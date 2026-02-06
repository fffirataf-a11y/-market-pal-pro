# iOS Build (GitHub Actions) – Sorun Giderme

## Yapılan Düzeltmeler

1. **Provisioning profile sadece Release için enjekte ediliyor**  
   Önceden `sed` ilk eşleşen `CODE_SIGN_STYLE` satırını (Debug) değiştiriyordu; Release tarafında `PROVISIONING_PROFILE` hiç set edilmiyordu. Artık sadece `CODE_SIGN_STYLE = Manual;` (Release) satırı değiştiriliyor.

2. **UUID çıkarımı güvenilir hale getirildi**  
   Profile önce `security cms -D` ile plist dosyasına decode ediliyor, UUID bu plist’ten okunuyor. UUID yoksa workflow net bir hata mesajıyla duruyor.

## "Sign in with Apple" veya "Profile is missing UUID" Hatası

Bu hata şunlardan kaynaklanabilir:

### 1. Provisioning profile’da "Sign in with Apple" yok

Uygulama `App.entitlements` içinde **Sign in with Apple** kullanıyor. Kullandığınız **Distribution (App Store)** provisioning profile’ın da bu capability’e sahip olması gerekir.

**Yapılacaklar:**

1. [Apple Developer](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles** → **Identifiers**.
2. **com.lionx.smartmarket** App ID’sini açın.
3. **Capabilities** bölümünde **Sign in with Apple**’ı işaretleyin, kaydedin.
4. **Profiles** → bu uygulama için kullandığınız **Distribution** profile’ı bulun.
5. Profile’ı **Edit** ile güncelleyin veya **Regenerate** edin (App ID’deki yeni capability ile yenilenecek).
6. Yeni profile’ı indirin (`.mobileprovision`).
7. Base64 encode edip repodaki **profile_V2_base64.txt** dosyasının içeriğini bu yeni base64 ile değiştirin (tek satır veya satır sonları temizlenmiş olabilir; workflow `tr -d '\r\n '` ile temizliyor).

### 2. Profile dosyası bozuk veya yanlış

- `profile_V2_base64.txt` **tam ve geçerli** bir `.mobileprovision` dosyasının base64’ü olmalı.
- Dosyayı macOS/Linux’ta üretmek için:  
  `base64 -i indirdiginiz.mobileprovision -o profile_V2_base64.txt`  
  (Windows’ta PowerShell/base64 araçlarıyla da üretebilirsiniz; çıktıyı tek satır yapmak iyi olur.)

### 3. Hâlâ "Failed to load profile" / "missing UUID"

- Decode edilen profile’ın gerçekten plist formatında ve içinde `UUID` anahtarı olduğundan emin olun.
- Apple Developer’dan **yeni indirdiğiniz** bir Distribution profile ile deneyin; eski veya farklı bir profile kullanıyor olmayın.

Bu adımlardan sonra workflow’u tekrar çalıştırın. Hata mesajları artık daha net; UUID veya profile decode hatası varsa ilgili adımda çıkacaktır.
