# Kargo Takip Sistemi

Sube bazli kargo yonetim paneli. Next.js 16 + Supabase + Tailwind CSS + shadcn/ui ile gelistirilmistir.

---

## Icindekiler

1. [Genel Bakis](#genel-bakis)
2. [Teknoloji Yigini](#teknoloji-yigini)
3. [Veritabani Yapisi](#veritabani-yapisi)
4. [Sayfa ve Modul Yapisi](#sayfa-ve-modul-yapisi)
5. [Giris Sistemi](#giris-sistemi)
6. [Kargo Islemleri](#kargo-islemleri)
7. [Barkod Yazdir](#barkod-yazdir)
8. [Musteri Yonetimi](#musteriler)
9. [Kasa Islemleri](#kasa-islemleri)
10. [Raporlar](#raporlar)
11. [Ayarlar](#ayarlar)
12. [API Route'lari](#api-routelari)
13. [Dosya Yapisi](#dosya-yapisi)
14. [Kurulum](#kurulum)
15. [Test Kullanicisi](#test-kullanicisi)

---

## Genel Bakis

Bu sistem, kargo subelerinin gunluk operasyonlarini yonetmek icin tasarlanmis bir web uygulamasidir. Her sube kendi kullanicisiyla giris yapar ve sadece kendi subesine ait kargoları, musterileri ve kasa islemlerini gorur/yonetir.

Temel ozellikler:
- Sube bazli kullanici giris/cikis sistemi (TC Kimlik No + Sifre)
- Kargo olusturma, yukleme, duzenleme ve iptal etme
- Parcali barkod yazdirma (adet kadar ayri etiket)
- Musteri kayit, duzenleme ve aktif/pasif yonetimi
- Kasa islemleri takibi
- Kargo raporu ve sube ciro raporu
- Iade kargo yonetimi
- Yazici ve sube ayarlari (peron no, sirket telefon)
- Tum veriler Supabase veritabaninda kalici olarak saklanir

---

## Teknoloji Yigini

| Teknoloji | Aciklama |
|-----------|----------|
| **Next.js 16** | App Router, Server Components, API Routes |
| **React 19** | Client Components, Hooks |
| **TypeScript** | Tip guvenligi |
| **Supabase** | PostgreSQL veritabani, Row Level Security |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | UI component kutuphanesi (Button, Input, Select, Table, Dialog vb.) |
| **Lucide React** | Ikon kutuphanesi |
| **Recharts** | Grafik kutuphanesi (Ana Sayfa grafikleri) |

---

## Veritabani Yapisi

Supabase PostgreSQL uzerinde 4 ana tablo bulunur. Tum tablolarda Row Level Security (RLS) aktiftir.

### `kullanicilar`
Sisteme giris yapan sube personeli.

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | UUID (PK) | Otomatik |
| tc_no | TEXT (UNIQUE) | TC Kimlik Numarasi |
| ad | TEXT | Kullanici adi |
| soyad | TEXT | Kullanici soyadi |
| telefon | TEXT | Telefon numarasi |
| sube | TEXT | Hangi subeye ait |
| sifre | TEXT | Giris sifresi |
| aktif | BOOLEAN | Hesap durumu |
| created_at | TIMESTAMPTZ | Kayit tarihi |

### `kargolar`
Tum kargo kayitlari.

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | UUID (PK) | Otomatik |
| kullanici_id | UUID (FK) | Kargoyu olusturan kullanici |
| sube | TEXT | Sube adi |
| status | TEXT | yuklenecek / giden / teslim / iptal |
| tracking_no | TEXT | Takip numarasi (GBZ-XXXXXX) |
| pieces | INTEGER | Parca adedi |
| sender | TEXT | Gonderici ad soyad |
| sender_telefon | TEXT | Gonderici telefon |
| receiver | TEXT | Alici ad soyad |
| receiver_telefon | TEXT | Alici telefon |
| from_location | TEXT | Cikis yeri (tam adres) |
| from_city | TEXT | Cikis sehri |
| to_location | TEXT | Varis yeri (tam adres) |
| to_city | TEXT | Varis sehri |
| amount | NUMERIC(10,2) | Kargo ucreti (TL) |
| firma | TEXT | Tasima firmasi |
| plate | TEXT | Arac plakasi |
| arac_telefon | TEXT | Arac/sofor telefonu |
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
| tc | TEXT | TC Kimlik No |
| ad | TEXT | Musteri adi |
| soyad | TEXT | Musteri soyadi |
| telefon | TEXT | Telefon numarasi |
| email | TEXT | E-posta (istege bagli) |
| durum | TEXT | aktif / pasif |
| created_at | TIMESTAMPTZ | Kayit tarihi |
| updated_at | TIMESTAMPTZ | Guncelleme tarihi |

**UNIQUE(sube, tc)** - Ayni subede ayni TC ile birden fazla musteri olamaz.

### `sube_ayarlar`
Sube bazli yazici ve genel ayarlar.

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | UUID (PK) | Otomatik |
| sube | TEXT (UNIQUE) | Sube adi |
| peron_no | TEXT | Peron numarasi (orn: 5/A) |
| sirket_telefon | TEXT | Sirket telefon numarasi |
| yazici_model | TEXT | Yazici modeli (varsayilan: zebra-gc420t) |
| yazici_port | TEXT | USB port (varsayilan: USB001) |
| yazici_ip | TEXT | Ag yazici IP adresi |
| baglanti_tipi | TEXT | usb / network |
| barkod_genislik | TEXT | Etiket genisligi (mm) |
| barkod_yukseklik | TEXT | Etiket yuksekligi (mm) |
| baski_hiz | TEXT | yavas / orta / hizli |
| baski_yogunluk | TEXT | dusuk / orta / yuksek |
| otomatik_barkod | BOOLEAN | Otomatik barkod basimi |

---

## Sayfa ve Modul Yapisi

Uygulama tek sayfa (SPA) mimarisinde calisir. `app/page.tsx` ana controller gorevini gorur ve `activePage` state'ine gore ilgili componenti render eder.

### Sayfalar

| Sayfa | Component | Aciklama |
|-------|-----------|----------|
| Ana Sayfa | `ana-sayfa.tsx` | Durum ozeti kartlari, kasa tutari, tutar ve adet grafikleri |
| Kargolar | `cargo-table.tsx` | Kargo listesi, filtreleme, barkod yazdirma, yukleme, duzenleme |
| Musteri Kayit | `musteriler.tsx` | Musteri ekleme, duzenleme, aktif/pasif yonetimi, TC/telefon ile arama |
| Kasa Islemleri | `kasa-islemleri.tsx` | Gunluk kasa hareketleri, gelir/gider takibi |
| Raporlar | `raporlar.tsx` | Kargo Raporu ve Sube Ciro Raporu alt sayfalari |
| Iade Kargolar | `iade-kargolar.tsx` | Iade edilen kargolarin listesi ve yonetimi |
| Ayarlar | `ayarlar.tsx` | Yazici ayarlari, peron no, sirket telefon, test barkod |

### Formlar / Modaller

| Component | Aciklama |
|-----------|----------|
| `new-cargo-form.tsx` | Yeni kargo olusturma formu (gonderici/alici bilgileri, SMS dogrulama, sehir secici) |
| `edit-cargo-form.tsx` | Mevcut kargo bilgilerini duzenleme |
| `load-cargo-form.tsx` | Kargo yukleme (firma, plaka, arac telefon, kalkis/varis saatleri) |
| `cancel-cargo-form.tsx` | Kargo iptal etme (onay ile) |
| `city-picker.tsx` | 81 il ve ilceleri iceren arama yapilabilir sehir/ilce secici |

---

## Giris Sistemi

- Kullanici TC Kimlik No ve Sifre ile giris yapar
- `/api/auth/login` route'u Supabase'deki `kullanicilar` tablosundan dogrulama yapar
- Basarili giriste kullanici bilgileri (id, ad, soyad, sube, tc_no) client state'ine kaydedilir
- "Beni Hatirla" secenegi ile bilgiler localStorage'da tutulur
- Giris sonrasi tum veriler (kargolar, musteriler, ayarlar) DB'den yuklenir
- Hatali giriste kirmizi X ikonu ile hata mesaji gosterilir
- Navigasyon barinda kullanici adi ve sube bilgisi goruntulenir

---

## Kargo Islemleri

### Yeni Kargo Olusturma
1. Gonderici bilgileri: TC, Ad, Soyad, Telefon, E-posta (istege bagli)
2. SMS dogrulama sistemi (4 haneli kod)
3. Alici bilgileri: TC, Ad, Soyad, Telefon
4. Alici sube/il/ilce secimi (81 il destegi)
5. Gonderi bilgileri: Gonderim tipi, icerik, parca adedi
6. Odeme: Odeme tipi (pesin/kart/alicidan), tutar, indirim
7. **Ayni subeye kargo gonderme engeli** - Kendi subesine kargo olusturulamaz

### Kargo Yukleme
- Firma adi, arac plakasi, arac telefonu
- Kalkis ve varis tarihi/saati
- Yukleme sonrasi durum "giden" olarak guncellenir
- Tum bilgiler DB'ye kaydedilir

### Kargo Duzenleme
- Mevcut kargo bilgilerinin duzenlenmesi
- Tutar, parca adedi, alici/gonderici bilgileri degistirilebilir

### Kargo Iptal
- Takip numarasi ile kargo bulunur
- Onay checkbox'i ile iptal edilir
- Durum "iptal" olarak guncellenir

### Filtreleme
- Duruma gore (yuklenecek, giden, teslim, iptal)
- Eski kargolari goster/gizle
- Iptal edilenleri goster/gizle

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
- Her etikette sag ustte ve tabloda parca numarasi buyuk puntoda gosterilir
- `page-break-after: always` ile her etiket ayri kagida cikar

### Telefon Maskeleme
Gizlilik icin telefon numaralari barkod etiketinde maskelenir:
- `5551234567` -> `(555) 1** ** 67`

---

## Musteriler

### Musteri Ekleme
- Kargo formu icinden "Musteri Ekle" butonu ile
- Musteriler sayfasindan "Yeni Musteri" butonu ile
- TC, Ad, Soyad, Telefon zorunlu; E-posta istege bagli
- Kaydedilen musteriler sonraki kargolarda otomatik doldurma icin kullanilir

### Musteri Duzenleme
- "Musteri Duzenle" butonu ile modal acilir
- TC veya Telefon numarasi ile musteri aranir
- Ad, Soyad, Telefon, E-posta degistirilebilir
- **Aktif/Pasif** durumu ayarlanabilir (yesil/kirmizi butonlar)

### Veritabani
- Tum musteriler Supabase `musteriler` tablosunda saklanir
- Giris yapildiginda sube bazli musteriler DB'den yuklenir
- Ekleme ve guncelleme aninda DB'ye kaydedilir
- Cikis/giris sonrasi veriler korunur

---

## Kasa Islemleri

- Gunluk gelir ve gider kayitlari
- Kargo ucretlerinden otomatik gelir hesaplama
- Manuel gelir/gider ekleme
- Toplam bakiye gosterimi

---

## Raporlar

### Kargo Raporu (`kargo-raporu.tsx`)
- Tarih araligina gore kargo listesi
- Durum bazli filtreleme
- Toplam adet ve tutar ozeti

### Sube Ciro Raporu (`sube-ciro-raporu.tsx`)
- Tarih araligina gore sube cirosu
- Baslangic/bitis tarihi secimi
- Toplam ciro hesaplama

---

## Ayarlar

### Yazici Ayarlari
- **Yazici Modeli:** Zebra GC420t (varsayilan) veya diger
- **Baglanti Tipi:** USB veya Network
- **USB Port:** USB001, USB002, USB003
- **Ag Yazici IP:** Network baglanti icin
- **Barkod Boyutu:** Genislik x Yukseklik (mm)
- **Baski Hizi:** Yavas / Orta / Hizli
- **Baski Yogunlugu:** Dusuk / Orta / Yuksek
- **Otomatik Barkod:** Kargo olusturuldiginda otomatik bas

### Sube Bilgileri
- **Peron Numarasi:** Barkod etiketinde gosterilir (orn: 5/A)
- **Sirket Telefon Numarasi:** Barkod etiketinde gosterilir (orn: 0507 533 41 93)

### Test Barkod
- Ayarlar kaydedildikten sonra "Test Barkod Bas" butonu ile ornek etiket basilabilir

Tum ayarlar Supabase `sube_ayarlar` tablosunda sube bazli saklanir.

---

## API Route'lari

| Route | Method | Aciklama |
|-------|--------|----------|
| `/api/auth/login` | POST | TC + Sifre ile giris dogrulamasi |
| `/api/kargolar` | GET | Sube bazli kargo listesi |
| `/api/kargolar` | POST | Yeni kargo kaydi |
| `/api/kargolar` | PATCH | Kargo guncelleme (durum, yukleme bilgileri vb.) |
| `/api/musteriler` | GET | Sube bazli musteri listesi |
| `/api/musteriler` | POST | Yeni musteri kaydi (upsert) |
| `/api/musteriler` | PATCH | Musteri bilgi guncelleme |
| `/api/ayarlar` | GET | Sube ayarlarini getir |
| `/api/ayarlar` | POST | Sube ayarlarini kaydet (upsert) |

---

## Dosya Yapisi

```
app/
  layout.tsx              # Ana layout (Inter font, ThemeProvider)
  page.tsx                # Ana controller (state yonetimi, DB senkronizasyon)
  globals.css             # Tailwind + tema degiskenleri
  api/
    auth/login/route.ts   # Giris API
    kargolar/route.ts     # Kargo CRUD API
    musteriler/route.ts   # Musteri CRUD API
    ayarlar/route.ts      # Ayarlar API

components/
  login-page.tsx          # Giris sayfasi
  forgot-password-page.tsx # Sifremi unuttum
  navigation.tsx          # Ust navigasyon bari
  ana-sayfa.tsx           # Dashboard (grafikler, ozet)
  cargo-table.tsx         # Kargo listesi + barkod yazdirma
  new-cargo-form.tsx      # Yeni kargo formu
  edit-cargo-form.tsx     # Kargo duzenleme formu
  load-cargo-form.tsx     # Kargo yukleme formu
  cancel-cargo-form.tsx   # Kargo iptal formu
  filter-bar.tsx          # Kargo filtreleme
  status-summary.tsx      # Durum ozet kartlari
  city-picker.tsx         # Sehir/ilce secici (81 il)
  musteriler.tsx          # Musteri yonetimi
  kasa-islemleri.tsx      # Kasa islemleri
  raporlar.tsx            # Rapor alt sayfa yonlendirme
  kargo-raporu.tsx        # Kargo raporu
  sube-ciro-raporu.tsx    # Sube ciro raporu
  iade-kargolar.tsx       # Iade kargolar
  ayarlar.tsx             # Yazici ve sube ayarlari
  toast-notification.tsx  # Bildirim componenti
  theme-provider.tsx      # Tema yonetimi
  ui/                     # shadcn/ui componentleri

lib/
  cargo-data.ts           # Cargo tipi, durum etiketleri, sehir listesi
  utils.ts                # Yardimci fonksiyonlar (cn)
  supabase/
    client.ts             # Browser Supabase client
    server.ts             # Server Supabase client
    middleware.ts          # Supabase middleware

middleware.ts             # Next.js middleware
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
Supabase SQL editorde asagidaki tablolari sirasiyla olusturun:
1. `kullanicilar` tablosu
2. `kargolar` tablosu
3. `sube_ayarlar` tablosu
4. `musteriler` tablosu

(Migration dosyalari `scripts/` klasorunde bulunur)

### 5. Uygulamayi calistirin
```bash
pnpm dev
```

Uygulama `http://localhost:3000` adresinde calisir.

---

## Test Kullanicisi

Sisteme giris yapmak icin asagidaki test kullanicisini kullanabilirsiniz:

| Alan | Deger |
|------|-------|
| TC Kimlik No | `25576219670` |
| Sifre | `123456` |
| Ad Soyad | Burak YILMAZ |
| Sube | Gebze |

---

## Notlar

- Tum metinler Turkce karakter desteklidir (i, o, u, s, c, g, I)
- Barkod etiketi UTF-8 charset ile basilir
- Tema destegi mevcuttur (acik/koyu)
- Responsive tasarim (mobil uyumlu navigasyon)
- Toast bildirimleri: basari (yesil tik), hata (kirmizi X)
- Tum CRUD islemleri aninda veritabanina senkronize edilir
