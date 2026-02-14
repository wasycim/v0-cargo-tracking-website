-- Kullanicilar tablosu: TC, isim, soyisim, telefon, sube, sifre
-- Sifre bcrypt hash olarak saklanacak, ancak basitlik icin
-- Supabase Auth kullanacagiz. Bu tablo profil bilgileri icin.

create table if not exists public.kullanicilar (
  id uuid primary key default gen_random_uuid(),
  tc_no text unique not null,
  ad text not null,
  soyad text not null,
  telefon text not null,
  sube text not null,
  sifre text not null,
  aktif boolean default true,
  created_at timestamptz default now()
);

-- RLS kapat: admin database uzerinden kullanici ekleyecek
-- Uygulama icinden sadece okuma yapilacak
alter table public.kullanicilar enable row level security;

-- Herkes okuyabilir (login icin gerekli)
create policy "kullanicilar_select_all" on public.kullanicilar
  for select using (true);

-- Insert/update/delete sadece service role ile yapilacak (admin)
-- Uygulama icinden insert/update/delete olmayacak
