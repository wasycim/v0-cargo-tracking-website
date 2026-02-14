import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET - Subeye gore musterileri getir
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sube = searchParams.get("sube")
  if (!sube) return NextResponse.json({ error: "sube required" }, { status: 400 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("musteriler")
    .select("*")
    .eq("sube", sube)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customers: data })
}

// POST - Yeni musteri ekle
export async function POST(req: Request) {
  const body = await req.json()
  const { sube, tc, ad, soyad, telefon, email } = body
  if (!sube || !tc || !ad || !soyad || !telefon) {
    return NextResponse.json({ error: "Eksik alan" }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("musteriler")
    .upsert(
      { sube, tc, ad, soyad, telefon, email: email || null, durum: "aktif", updated_at: new Date().toISOString() },
      { onConflict: "sube,tc" }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customer: data })
}

// PATCH - Musteri guncelle
export async function PATCH(req: Request) {
  const body = await req.json()
  const { sube, tc, ...updates } = body
  if (!sube || !tc) {
    return NextResponse.json({ error: "sube ve tc gerekli" }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("musteriler")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("sube", sube)
    .eq("tc", tc)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customer: data })
}
