import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { error } = await supabase.rpc('exec_sql', {
  query: `
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
  `
})

if (error) {
  // Try direct REST approach
  console.log('RPC failed, trying direct approach...')
  
  // Test if table already exists
  const { data, error: selectError } = await supabase
    .from('user_logs')
    .select('id')
    .limit(1)
  
  if (selectError && selectError.code === '42P01') {
    console.log('Table does not exist. Please create it via Supabase Dashboard SQL Editor.')
    console.log('SQL:')
    console.log(`
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

alter table public.user_logs enable row level security;

create policy "user_logs_select_all" on public.user_logs
  for select using (true);

create policy "user_logs_insert_all" on public.user_logs
  for insert with check (true);
    `)
  } else if (selectError) {
    console.log('Error:', selectError.message)
  } else {
    console.log('Table user_logs already exists!')
  }
} else {
  console.log('Table created successfully!')
}
