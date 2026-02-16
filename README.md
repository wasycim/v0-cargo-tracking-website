# Kargo Takip Sistemi

Sube bazli kargo yonetim paneli. Next.js 16 + Supabase + Tailwind CSS + shadcn/ui ile gelistirilmistir.
WhatsApp uzerinden OTP dogrulama ve kargo bildirim sistemi icerir.

---

## Icindekiler

1. [Genel Bakis](#genel-bakis)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [Teknoloji Yigini](#teknoloji-yigini)
4. [Veritabani Yapisi](#veritabani-yapisi)
5. [Sayfa ve Modul Yapisi](#sayfa-ve-modul-yapisi)
6. [Giris Sistemi](#giris-sistemi)
7. [WhatsApp Bot Sistemi](#whatsapp-bot-sistemi)
8. [OTP Dogrulama Akisi](#otp-dogrulama-akisi)
9. [Kargo Bildirimleri](#kargo-bildirimleri)
10. [Sifremi Unuttum](#sifremi-unuttum)
11. [Kargo Islemleri](#kargo-islemleri)
12. [Barkod Yazdir](#barkod-yazdir)
13. [Musteri Yonetimi](#musteri-yonetimi)
14. [Kasa Islemleri](#kasa-islemleri)
15. [Raporlar](#raporlar)
16. [Ayarlar](#ayarlar)
17. [API Route'lari](#api-routelari)
18. [Dosya Yapisi](#dosya-yapisi)
19. [Kurulum](#kurulum)
20. [WhatsApp Bot Kurulumu](#whatsapp-bot-kurulumu)
21. [Sube Kodu Atama](#sube-kodu-atama)
22. [Test Kullanicisi](#test-kullanicisi)

---

## Genel Bakis

Bu sistem, kargo subelerinin gunluk operasyonlarini yonetmek icin tasarlanmis bir web uygulamasidir.
Her sube kendi kullanicisiyla giris yapar ve sadece kendi subesine ait kargoları, musterileri ve kasa islemlerini gorur/yonetir.

Temel ozellikler:
- Sube bazli kullanici giris/cikis sistemi (TC Kimlik No + Sifre)
- Kargo olusturma, yukleme, duzenleme ve iptal etme
- WhatsApp uzerinden OTP (telefon dogrulama) sistemi
- WhatsApp uzerinden kargo yukleme/guncelleme bildirimleri
- WhatsApp uzerinden sifre hatirlatma
- Her sube icin ayri WhatsApp botu (sube_kodu bazli)
- Parcali barkod yazdirma (adet kadar ayri etiket)
- Musteri kayit, duzenleme ve aktif/pasif yonetimi
- Kasa islemleri takibi (gece 00:00'da otomatik sifirlama)
- Kargo raporu ve sube ciro raporu
- Iade kargo yonetimi
- Yazici ve sube ayarlari
- Koyu/acik tema destegi

---

## Sistem Mimarisi

```
  KULLANICI (Tarayici)
       |
       v
  [Next.js Web App - Vercel]
       |
       |-- /api/sms/send -----> otp_requests tablosu (Supabase)
       |-- /api/sms/notify ---> whatsapp_messages tablosu (Supabase)
       |-- /api/sms/verify ---> otp_requests dogrulama (Supabase)
       |-- /api/auth/forgot --> whatsapp_messages tablosu (Supabase)
       |-- /api/kargolar -----> kargolar tablosu (Supabase)
       |-- /api/musteriler ---> musteriler tablosu (Supabase)
       |-- /api/ayarlar ------> sube_ayarlar tablosu (Supabase)
       |-- /api/auth/login ---> kullanicilar tablosu (Supabase)
       |
       v
  [Supabase PostgreSQL]
       ^
       |
  [WhatsApp Bot - Ofis Bilgisayari]
       |
       |-- otp_requests tablosunu dinler (pending + sube_kodu filtresi)
       |-- whatsapp_messages tablosunu dinler (pending + sube_kodu filtresi)
       |-- WhatsApp Web uzerinden mesaj gonderir
       |-- Her 5 saniyede kontrol eder
```

**Onemli:** WhatsApp botu Vercel'de degil, her subenin kendi ofis bilgisayarinda calisir.
Her sube kendi `SUBE_KODU` degeriyle botu calistirir ve sadece kendi mesajlarini isler.

---

## Teknoloji Yigini

| Teknoloji | Aciklama |
|-----------|----------|
| **Next.js 16** | App Router, Server Components, API Routes |
| **React 19** | Client Components, Hooks |
| **TypeScript** | Tip guvenligi |
| **Supabase** | PostgreSQL veritabani, Row Level Security |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | UI component kutuphanesi |
| **Lucide React** | Ikon kutuphanesi |
| **Recharts** | Grafik kutuphanesi (Ana Sayfa grafikleri, dynamic import ile yuklenir) |
| **whatsapp-web.js** | WhatsApp Web API (ofis botu icin, headless Puppeteer) |
| **qrcode-terminal** | Terminalde QR kod gosterimi (bot icin) |

---

## Veritabani Yapisi

Supabase PostgreSQL uzerinde 6 tablo bulunur. Tum tablolarda Row Level Security (RLS) aktiftir.

### `kullanicilar`
Sisteme giris yapan sube personeli.

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | UUID (PK) | Otomatik |
| tc_no | TEXT (UNIQUE) | TC Kimlik Numarasi |
| ad | TEXT | Kullanici adi |
| soyad | TEXT | Kullanici soyadi |
| telefon | TEXT | Telefon numarasi |
| sube | TEXT | Sube adi (gorsel, orn: "Gebze Carsi") |
| sube_kodu | TEXT | Sube kodu (benzersiz, orn: "GBZ") |
| sifre | TEXT | Giris sifresi |
| aktif | BOOLEAN | Hesap durumu |
| created_at | TIMESTAMPTZ | Kayit tarihi |

**Not:** `sube` alani gorsel isimdir, istenen hersey yazilabilir (orn: "Gebze", "Gebze Carsi").
Onemli olan `sube_kodu` alanidir - WhatsApp botu ve mesaj yonlendirme buna gore calisir.

### `kargolar`
Tum kargo kayitlari.

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | UUID (PK) | Otomatik |
| kullanici_id | UUID (FK) | Kargoyu olusturan kullanici |
| sube | TEXT | Sube adi |
| status | TEXT | yuklenecek / giden / gonderildi / teslim / iptal |
| tracking_no | TEXT | Takip numarasi (GBZ-XXXXXX) |
| pieces | INTEGER | Parca adedi |
| sender | TEXT | Gonderici ad soyad |
| sender_telefon | TEXT | Gonderici telefon |
| receiver | TEXT | Alici ad soyad |
| receiver_telefon | TEXT | Alici telefon |
| from_location | TEXT | Cikis yeri (il/ilce) |
| from_city | TEXT | Cikis sehri |
| to_location | TEXT | Varis yeri (il/ilce) |
| to_city | TEXT | Varis sehri |
| amount | NUMERIC(10,2) | Kargo ucreti (TL) |
| firma | TEXT | Tasima firmasi |
| plate | TEXT | Arac plakasi |
| arac_telefon | TEXT | Arac/sofor telefonu |
| gonderim_tipi | TEXT | ah (alici haberli) / gh (gonderici haberli) / agh (ikisi) |
| departure_date | TEXT | Kalkis tarihi |
| departure_time | TEXT | Kalkis saati |
| arrival_date | TEXT | Varis tarihi |
| arrival_time | TEXT | Varis saati |
| created_at | TIMESTAMPTZ | Kayit tarihi |

### `musteriler`
Kayitli musteriler (sube bazli).

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | UUID (PK) | Otomatik |
| sube | TEXT | Hangi subeye ait |
| tc | TEXT | TC Kimlik No (maks 11 hane) |
| ad | TEXT | Musteri adi |
| soyad | TEXT | Musteri soyadi |
| telefon | TEXT | Telefon numarasi |
| email | TEXT | E-posta (istege bagli) |
| durum | TEXT | aktif / pasif |
| created_at | TIMESTAMPTZ | Kayit tarihi |
| updated_at | TIMESTAMPTZ | Guncelleme tarihi |

**UNIQUE(sube, tc)** - Ayni subede ayni TC ile birden fazla musteri olamaz.

### `otp_requests`
Telefon dogrulama kodlari. Web uygulama yazar, WhatsApp botu okuyup gonderir.

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | UUID (PK) | Otomatik |
| phone_number | TEXT | Dogrulama yapilacak telefon numarasi |
| otp_code | TEXT | 6 haneli dogrulama kodu |
| status | TEXT | pending / sent / verified / expired / failed |
| sube_kodu | TEXT | Hangi subenin botu isleyecek |
| created_at | TIMESTAMPTZ | Olusturma zamani |

**Akis:** Web app "pending" kaydeder -> Bot "pending + sube_kodu" filtresiyle okur -> WhatsApp'tan gonderir -> Status'u "sent" yapar -> Kullanici kodu girer -> Web app "verified" yapar.

### `whatsapp_messages`
Kargo bildirimleri ve sifre hatirlatma mesajlari. Web uygulama yazar, WhatsApp botu okuyup gonderir.

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | UUID (PK) | Otomatik |
| phone_number | TEXT | Mesaj gonderilecek telefon numarasi |
| message | TEXT | Mesaj icerigi |
| message_type | TEXT | notification / password_reset |
| status | TEXT | pending / sent / failed |
| sube_kodu | TEXT | Hangi subenin botu isleyecek |
| created_at | TIMESTAMPTZ | Olusturma zamani |

### `sube_ayarlar`
Sube bazli yazici ve genel ayarlar.

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | UUID (PK) | Otomatik |
| sube | TEXT (UNIQUE) | Sube adi |
| peron_no | TEXT | Peron numarasi (orn: 5/A) |
| sirket_telefon | TEXT | Sirket telefon numarasi |
| yazici_model | TEXT | Yazici modeli (varsayilan: zebra-gc420t) |
| yazici_port | TEXT | USB port |
| yazici_ip | TEXT | Ag yazici IP adresi |
| baglanti_tipi | TEXT | usb / network |
| barkod_genislik | TEXT | Etiket genisligi (mm) |
| barkod_yukseklik | TEXT | Etiket yuksekligi (mm) |
| baski_hiz | TEXT | yavas / orta / hizli |
| baski_yogunluk | TEXT | dusuk / orta / yuksek |
| otomatik_barkod | BOOLEAN | Otomatik barkod basimi |

---

## Sayfa ve Modul Yapisi

Uygulama tek sayfa (SPA) mimarisinde calisir. `app/page.tsx` ana controller gorevini gorur
ve `activePage` state'ine gore ilgili componenti render eder.

### Sayfalar

| Sayfa | Component | Aciklama |
|-------|-----------|----------|
| Ana Sayfa | `ana-sayfa.tsx` | Durum ozeti kartlari, kasa tutari, son 7 gun tutar/adet grafikleri |
| Kargolar | `cargo-table.tsx` | Kargo listesi, filtreleme (giden/gonderildi/eski/iptal), barkod yazdirma |
| Gonderilenler | (ayni tablo, gonderildi filtresi) | Gonderilmis kargolarin listesi |
| Musteriler | `musteriler.tsx` | Musteri ekleme, duzenleme, TC/telefon ile arama |
| Kasa Islemleri | `kasa-islemleri.tsx` | Gunluk kasa hareketleri, gelir/gider takibi |
| Raporlar | `raporlar.tsx` | Kargo Raporu ve Sube Ciro Raporu alt sayfalari |
| Ayarlar | `ayarlar.tsx` | Yazici ayarlari, peron no, sirket telefon |

### Formlar / Modaller

| Component | Aciklama |
|-----------|----------|
| `new-cargo-form.tsx` | Yeni kargo olusturma (gonderici/alici bilgileri, WhatsApp OTP dogrulama, sehir secici) |
| `edit-cargo-form.tsx` | Mevcut kargo bilgilerini duzenleme |
| `load-cargo-form.tsx` | Kargo yukleme (firma, plaka, arac telefon, kalkis/varis saatleri) |
| `cancel-cargo-form.tsx` | Kargo iptal etme (onay ile) |
| `city-picker.tsx` | 81 il ve ilceleri iceren arama yapilabilir sehir/ilce secici |
| `forgot-password-page.tsx` | TC + telefon ile sifre hatirlatma (WhatsApp'a gonderir) |

### Status Summary Butonlari

Ust taraftaki durum ozet kartlari tiklanabilir:
- **Yuklenecek** -> Kargolar sayfasina gider
- **Giden** -> Kargolar sayfasina gider
- **Gonderildi** -> Gonderilenler sayfasina gider
- **Iptal** -> Tiklanamaz (sadece sayi gosterir)

### Filtre Checkboxlari

Kargolar sayfasinda:
- **Giden** (varsayilan: acik) - Giden durumundaki kargoları goster
- **Gonderildi** (varsayilan: kapali) - Gonderildi durumundaki kargolari goster
- **Eski Kargolari Goruntule** - Bugunun oncesindeki kargolari da goster
- **Iptal edilenleri goster** - Iptal edilen kargolari goster

---

## Giris Sistemi

- Kullanici TC Kimlik No ve Sifre ile giris yapar
- `/api/auth/login` route'u Supabase'deki `kullanicilar` tablosundan dogrulama yapar
- Basarili giriste kullanici bilgileri (id, ad, soyad, sube, sube_kodu, tc_no) client state'ine kaydedilir
- `sube_kodu` tum WhatsApp islemlerinde kullanilir (OTP, bildirim, sifre hatirlatma)
- "Beni Hatirla" secenegi ile bilgiler localStorage'da tutulur
- Navigasyon barinda kullanici adi ve sube bilgisi goruntulenir

---

## WhatsApp Bot Sistemi

### Neden WhatsApp?
- SMS maliyeti ve Turkiye bolgesi kisitlamalari nedeniyle WhatsApp kullanilir
- Tamamen ucretsiz
- Her subenin kendi WhatsApp numarasi uzerinden gonderilir

### Mimari
Web uygulamasi (Vercel) mesajlari dogrudan WhatsApp'a gondermez.
Bunun yerine Supabase veritabanina `pending` statusunde yazar.
Her subenin ofis bilgisayarinda calisan bir Node.js botu (`bot.js`) bu tablolari
her 5 saniyede kontrol eder ve kendi `sube_kodu`'na ait pending kayitlari bulup
WhatsApp Web uzerinden gonderir.

### Sube Bazli Ayirma
Her bot `SUBE_KODU` degiskeniyle calisir:
```
Ankara subesi -> SUBE_KODU = "ANK" -> sadece sube_kodu="ANK" kayitlari isler
Gebze subesi  -> SUBE_KODU = "GBZ" -> sadece sube_kodu="GBZ" kayitlari isler
Istanbul subesi -> SUBE_KODU = "IST" -> sadece sube_kodu="IST" kayitlari isler
```

Her bot kendi WhatsApp session'ini ayri klasorde saklar (`sube-ANK`, `sube-GBZ` gibi).
Birden fazla sube ayni bilgisayarda farkli `SUBE_KODU` ile calistirabilir.

### Bot Ozellikleri
- **Headless calisir** - Ekranda hicbir pencere acilmaz (Puppeteer headless mode)
- **QR kodu terminalde gosterir** - Ilk calistirmada telefon ile okutulur
- **Session kalici** - Bir kere QR okutulduktan sonra otomatik baglanir
- **Otomatik yeniden baglanti** - Baglanti koparsa kendini yeniden baglama dener
- **Hata yonetimi** - WhatsApp'ta kayitli olmayan numaralar icin uyari verir

---

## OTP Dogrulama Akisi

Yeni kargo olusturulurken gonderici telefonu dogrulanir:

```
1. Kullanici telefon numarasi girer, "Kod Gonder" basar
2. Frontend -> POST /api/sms/send { telefon, sube_kodu }
3. API 6 haneli rastgele kod uretir
4. otp_requests tablosuna kaydeder: { phone_number, otp_code, status:"pending", sube_kodu }
5. WhatsApp botu (ofis bilgisayari) pending kaydi gorur
6. Bot, WhatsApp Web uzerinden kullaniciya kodu gonderir
7. Bot, status'u "sent" yapar
8. Kullanici gelen 6 haneli kodu girer, "Dogrula" basar
9. Frontend -> POST /api/sms/verify { telefon, kod }
10. API kodu kontrol eder (5 dk gecerlilik suresi)
11. Eslestiyse status "verified" yapilir, islem basarili
```

**Kod Guvenligi:**
- Her kod 5 dakika gecerlidir
- Kullanilmis kod tekrar kullanilamaz (status "verified" olur)
- Sureleri dolmus kodlar "expired" olarak isaretlenir

---

## Kargo Bildirimleri

### Kargo Yuklendiginde
Kargo "giden" durumuna alindiginda, gonderim tipine gore WhatsApp bildirimi gonderilir:

| Gonderim Tipi | Kod | Kime Gonderilir |
|---------------|-----|-----------------|
| Alici Haberli | ah | Alici telefon numarasina |
| Gonderici Haberli | gh | Gonderici telefon numarasina |
| Her Ikisi | agh | Hem aliciya hem gondericiye |

**Mesaj formati:**
```
BALIKESIR KARGOSU
Firma Adi
34 ABC 123
0555 555 55 55
KALKIS: 14:00
VARIS: 22:00
```

### Arac Bilgisi Guncellendiginde
Firma, plaka, arac telefon veya kalkis/varis saati guncellendiginde
ayni gonderim tipine gore "GUNCELLEME" etiketli bildirim gonderilir:

```
BALIKESIR KARGOSU (GUNCELLEME)
Yeni Firma Adi
34 XYZ 789
0555 000 00 00
KALKIS: 15:30
VARIS: 23:00
```

### Akis
```
1. Kullanici kargo yukler veya arac bilgisi gunceller
2. Frontend -> POST /api/sms/notify { telefonlar, mesaj, sube_kodu }
3. API her telefon icin whatsapp_messages tablosuna pending kayit ekler
4. WhatsApp botu kaydi gorur, mesaji WhatsApp'tan gonderir
5. Status "sent" yapilir
```

---

## Sifremi Unuttum

1. Kullanici giris ekraninda "Sifremi Unuttum" linkine tiklar
2. TC Kimlik No ve telefon numarasi girer
3. Frontend -> POST /api/auth/forgot-password { tc_no, telefon }
4. API kullanicilar tablosundan TC + telefon eslesir mi kontrol eder
5. Eslestiyse sifreyi whatsapp_messages tablosuna yazar (message_type: "password_reset")
6. WhatsApp botu mesaji kullanicinin WhatsApp'ina gonderir:
   ```
   *Kargo Takip - Sifre Hatirlatma*

   Sayin Ad Soyad,
   Sisteme giris sifreniz: 123456

   Bu mesaj otomatik gonderilmistir.
   ```

---

## Kargo Islemleri

### Yeni Kargo Olusturma
1. Gonderici bilgileri: TC, Ad, Soyad, Telefon, E-posta (istege bagli)
2. WhatsApp OTP dogrulama (6 haneli kod)
3. Alici bilgileri: TC, Ad, Soyad, Telefon
4. Alici sube/il/ilce secimi (81 il destegi)
5. Gonderi bilgileri: Gonderim tipi (AH/GH/AGH), icerik, parca adedi
6. Odeme: Odeme tipi (pesin/kart/alicidan), tutar, indirim
7. **Ayni subeye kargo gonderme engeli** - Kendi subesine kargo olusturulamaz

### Kargo Yukleme
- Firma adi, arac plakasi, arac telefonu
- Kalkis ve varis tarihi/saati
- Yukleme sonrasi durum "giden" olarak guncellenir
- WhatsApp bildirimi gonderilir (gonderim tipine gore)

### Kargo Duzenleme
- Mevcut kargo bilgilerinin duzenlenmesi
- Arac bilgisi degisirse WhatsApp guncelleme bildirimi gonderilir

### Kargo Iptal
- Takip numarasi ile kargo bulunur
- Onay checkbox'i ile iptal edilir
- Durum "iptal" olarak guncellenir

### Durum Gecisleri
```
yuklenecek -> giden (yukleme formu ile)
giden -> gonderildi (teslim edildi)
herhangi -> iptal (iptal formu ile)
```

---

## Barkod Yazdir

Barkod etiketi **100mm x 70mm** boyutunda tasarlanmistir (Zebra GC420t uyumlu).

### Etiket Icerigi
- **Sol ust:** Hedef sehir (buyuk punto), cikis sehri
- **Sag ust:** Gonderim kodu, takip numarasi, parca numarasi (1/3 gibi)
- **Orta:** Hat bilgisi (orn: ANKARA HATTI)
- **Tablo:** Gonderici bilgileri, tarih, turu, parca no
- **Tablo:** Alici bilgileri
- **Alt bilgi:** Sube adi / Peron No / Sirket Telefon

### Parcali Basim
Parca adedi kac ise o kadar ayri barkod etiketi basilir:
- 3 parcali kargoda: **3/3**, **2/3**, **1/3** seklinde 3 ayri sayfa
- Her etikette parca numarasi buyuk puntoda gosterilir

### Telefon Maskeleme
Gizlilik icin telefon numaralari barkod etiketinde maskelenir:
- `5555555555` -> `(555) 5** ** 55`

---

## Musteri Yonetimi

- Kargo formu icinden veya Musteriler sayfasindan eklenir
- TC, Ad, Soyad, Telefon zorunlu; E-posta istege bagli
- TC aramasinda maks 11 hane siniri vardir
- Kayitli musteriler kargo formunda otomatik tamamlama icin kullanilir
- Aktif/Pasif durumu yonetilebilir
- Sube bazli saklanir (her sube kendi musterilerini gorur)

---

## Kasa Islemleri

- Gunluk gelir ve gider kayitlari
- Kargo ucretlerinden otomatik gelir hesaplama
- Manuel gelir/gider ekleme
- **Her gece saat 00:00'da kasa otomatik sifirlanir**
- Anlik kasa tutari status barda gosterilir

---

## Raporlar

### Kargo Raporu
- Tarih araligina gore kargo listesi (varsayilan: bugun)
- Durum bazli filtreleme
- Toplam adet ve tutar ozeti

### Sube Ciro Raporu
- Tarih araligina gore sube cirosu (varsayilan: bugun)
- Toplam ciro hesaplama

### Iade Kargolar
- Tarih araligina gore iade kargo listesi (varsayilan: bugun)

---

## Ayarlar

### Yazici Ayarlari
- Yazici Modeli, Baglanti Tipi, USB Port / Ag IP
- Barkod Boyutu (Genislik x Yukseklik mm)
- Baski Hizi ve Yogunlugu
- Otomatik Barkod basimi

### Sube Bilgileri
- Peron Numarasi (barkod etiketinde gosterilir)
- Sirket Telefon Numarasi (barkod etiketinde gosterilir)

---

## API Route'lari

| Route | Method | Aciklama |
|-------|--------|----------|
| `/api/auth/login` | POST | TC + Sifre ile giris (sube_kodu dahil doner) |
| `/api/auth/forgot-password` | POST | TC + telefon ile sifre hatirlatma (WhatsApp) |
| `/api/kargolar` | GET | Sube bazli kargo listesi |
| `/api/kargolar` | POST | Yeni kargo kaydi (gonderim_tipi dahil) |
| `/api/kargolar` | PATCH | Kargo guncelleme (durum, yukleme bilgileri vb.) |
| `/api/musteriler` | GET | Sube bazli musteri listesi |
| `/api/musteriler` | POST | Yeni musteri kaydi (upsert) |
| `/api/musteriler` | PATCH | Musteri bilgi guncelleme |
| `/api/ayarlar` | GET | Sube ayarlarini getir |
| `/api/ayarlar` | POST | Sube ayarlarini kaydet (upsert) |
| `/api/sms/send` | POST | OTP kodu uretip otp_requests'e yazar (sube_kodu ile) |
| `/api/sms/verify` | POST | OTP kodunu dogrular (5 dk gecerlilik) |
| `/api/sms/notify` | POST | Kargo bildirimini whatsapp_messages'a yazar (sube_kodu ile) |

---

## Dosya Yapisi

```
app/
  layout.tsx                    # Ana layout (Inter font, ThemeProvider)
  page.tsx                      # Ana controller (state yonetimi, DB senkronizasyon)
  globals.css                   # Tailwind + tema degiskenleri
  api/
    auth/
      login/route.ts            # Giris API (sube_kodu dahil)
      forgot-password/route.ts  # Sifre hatirlatma API (WhatsApp)
    kargolar/route.ts           # Kargo CRUD API
    musteriler/route.ts         # Musteri CRUD API
    ayarlar/route.ts            # Ayarlar API
    sms/
      send/route.ts             # OTP kod uretme + DB kayit
      verify/route.ts           # OTP kod dogrulama
      notify/route.ts           # Kargo bildirim kayit

components/
  login-page.tsx                # Giris sayfasi (KullaniciInfo tipi burada)
  forgot-password-page.tsx      # Sifremi unuttum (TC + telefon ile WhatsApp)
  navigation.tsx                # Ust navigasyon bari (AppPage tipi burada)
  ana-sayfa.tsx                 # Dashboard (grafikler dynamic import ile yuklenir)
  charts/
    tutar-chart.tsx             # Tutar grafigi (Recharts, SSR-free)
    adet-chart.tsx              # Adet grafigi (Recharts, SSR-free)
  status-summary.tsx            # Durum ozet kartlari (tiklanabilir navigasyon)
  filter-bar.tsx                # Kargo filtreleme (giden/gonderildi/eski/iptal)
  cargo-table.tsx               # Kargo listesi + barkod yazdirma
  new-cargo-form.tsx            # Yeni kargo formu (WhatsApp OTP dahil)
  edit-cargo-form.tsx           # Kargo duzenleme formu
  load-cargo-form.tsx           # Kargo yukleme formu
  cancel-cargo-form.tsx         # Kargo iptal formu
  city-picker.tsx               # Sehir/ilce secici (81 il)
  musteriler.tsx                # Musteri yonetimi
  kasa-islemleri.tsx            # Kasa islemleri
  raporlar.tsx                  # Rapor alt sayfa yonlendirme
  kargo-raporu.tsx              # Kargo raporu
  sube-ciro-raporu.tsx          # Sube ciro raporu
  iade-kargolar.tsx             # Iade kargolar
  ayarlar.tsx                   # Yazici ve sube ayarlari
  toast-notification.tsx        # Bildirim componenti
  theme-provider.tsx            # Tema yonetimi (koyu/acik)
  ui/                           # shadcn/ui componentleri

lib/
  cargo-data.ts                 # Cargo tipi, durum etiketleri/renkleri, 81 il listesi
  utils.ts                      # Yardimci fonksiyonlar (cn)
  supabase/
    client.ts                   # Browser Supabase client
    server.ts                   # Server Supabase client
    middleware.ts               # Supabase middleware

scripts/
  001_create_kullanicilar.sql   # Kullanicilar tablo migration
  whatsapp-bot/
    bot.js                      # WhatsApp botu (Node.js, ofis bilgisayarinda calisir)
    package.json                # Bot bagimliliklari
```

---

## Kurulum

### 1. Projeyi indirin
v0 arayuzunden "Download ZIP" veya GitHub uzerinden klonlayin.

### 2. Bagimliliklari yukleyin
```bash
pnpm install
```

### 3. Supabase Entegrasyonu
Supabase projesi olusturup asagidaki environment variable'lari `.env.local` dosyasina ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Veritabani Tablolarini Olusturun
Supabase SQL editorde 6 tabloyu olusturun:
1. `kullanicilar` - Sube personeli (sube_kodu kolonu dahil)
2. `kargolar` - Kargo kayitlari (gonderim_tipi kolonu dahil)
3. `musteriler` - Musteri kayitlari
4. `sube_ayarlar` - Sube yazici ayarlari
5. `otp_requests` - OTP dogrulama kodlari (sube_kodu kolonu dahil)
6. `whatsapp_messages` - WhatsApp mesaj kuyrugu (sube_kodu kolonu dahil)

### 5. Uygulamayi calistirin
```bash
pnpm dev
```

Uygulama `http://localhost:3000` adresinde calisir.

---

## WhatsApp Bot Kurulumu

Her sube kendi ofis bilgisayarinda botu calistirir.

### Gereksinimler
- Node.js 18 veya ustu (nodejs.org)
- Google Chrome veya Chromium (Puppeteer icin)

### Adimlar

1. `scripts/whatsapp-bot/` klasorunu ofis bilgisayarina kopyalayin

2. `bot.js` dosyasindaki 3 degeri doldurun:
   ```js
   const SUPABASE_URL = "https://xxxxx.supabase.co";
   const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIs...";
   const SUBE_KODU = "GBZ";  // Bu subenin kodu
   ```

3. Bagimliliklari yukleyin:
   ```bash
   cd whatsapp-bot
   npm install
   ```

4. Botu baslatin:
   ```bash
   node bot.js
   ```

5. Terminalde QR kod goruncek. Telefondan:
   - WhatsApp ac
   - Bagli Cihazlar
   - Cihaz Bagla
   - QR kodu okut

6. "WHATSAPP BAGLANDI!" mesaji goruncek, bot calismaya baslar.

### Onemli Notlar
- QR okutma sadece ilk sefer gerekir, session otomatik kaydedilir
- Bot headless calisir, ekranda hicbir pencere acilmaz
- Botu durdurmak icin `CTRL+C` basin
- Birden fazla sube ayni bilgisayarda farkli `SUBE_KODU` ile calistirabilir
- Bot her 5 saniyede Supabase'i kontrol eder
- `.wwebjs_auth` klasorunu silersek QR tekrar gerekir

---

## Sube Kodu Atama

### Supabase'den kullaniciya sube_kodu atama:
```sql
UPDATE kullanicilar
SET sube_kodu = 'GBZ'
WHERE sube = 'Gebze';

UPDATE kullanicilar
SET sube_kodu = 'ANK'
WHERE sube = 'Ankara';
```

### Kurallar:
- `sube_kodu` kisa ve benzersiz olmali (2-4 harf onerilir)
- `sube` alani istenen herhangi bir isim olabilir ("Gebze", "Gebze Carsi" vb.)
- Onemli olan `sube_kodu`'nun bot'taki `SUBE_KODU` degiskeniyle ayni olmasi
- Her kullanicinin `sube_kodu`'su, o subenin WhatsApp botuna mesaj yonlendirmek icin kullanilir

---

## Test Kullanicisi

| Alan | Deger |
|------|-------|
| TC Kimlik No | `11111111111` |
| Sifre | `123456` |
| Ad Soyad | Yigit Caliskan |
| Sube | Gebze |
| Sube Kodu | (Supabase'den atayin) |

---

## Notlar

- Tum metinler Turkce karakter desteklidir
- Barkod etiketi UTF-8 charset ile basilir
- Koyu/acik tema destegi mevcuttur
- Responsive tasarim (mobil uyumlu navigasyon)
- Toast bildirimleri: basari (yesil tik), hata (kirmizi X)
- Tum CRUD islemleri aninda veritabanina senkronize edilir
- Kasa her gece 00:00'da otomatik sifirlanir
- Raporlarda varsayilan tarih bugundur
- Grafik bilesinleri `next/dynamic` ile SSR-free yuklenir (d3 locale chunk hatasi onlemi)
- `statusColors` Proxy ile sarilmistir, bilinmeyen status degerlerinde gri fallback doner
