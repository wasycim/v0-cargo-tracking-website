-- Kullanici giris/cikis logları tablosu
create table if not exists public.user_logs (
  id uuid primary key default gen_random_uuid(),
  kullanici_id uuid references public.kullanicilar(id),
  kullanici_ad text not null,
  kullanici_soyad text not null,
  sube text not null,
  islem_tipi text not null check (islem_tipi in ('giris', 'cikis')),
  ip_adresi text,
  created_at timestamptz default now()
);

-- RLS
alter table public.user_logs enable row level security;

-- Herkes okuyabilir
create policy "user_logs_select_all" on public.user_logs
  for select using (true);

-- Herkes insert yapabilir (login/logout kaydi icin)
create policy "user_logs_insert_all" on public.user_logs
  for insert with check (true);
