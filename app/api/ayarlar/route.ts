import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - şube ayarlarını getir
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sube = searchParams.get("sube")

  if (!sube) {
    return NextResponse.json({ error: "Şube parametresi gerekli" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("sube_ayarlar")
    .select("*")
    .eq("sube", sube)
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ayarlar: data || null })
}

// POST - şube ayarlarını kaydet veya güncelle
export async function POST(request: Request) {
  const body = await request.json()

  if (!body.sube) {
    return NextResponse.json({ error: "Şube gerekli" }, { status: 400 })
  }

  // Check if exists
  const { data: existing } = await supabase
    .from("sube_ayarlar")
    .select("id")
    .eq("sube", body.sube)
    .single()

  let result
  if (existing) {
    // Update
    const { data, error } = await supabase
      .from("sube_ayarlar")
      .update({
        peron_no: body.peron_no,
        sirket_telefon: body.sirket_telefon,
        yazici_model: body.yazici_model,
        yazici_port: body.yazici_port,
        yazici_ip: body.yazici_ip,
        baglanti_tipi: body.baglanti_tipi,
        barkod_genislik: body.barkod_genislik,
        barkod_yukseklik: body.barkod_yukseklik,
        baski_hiz: body.baski_hiz,
        baski_yogunluk: body.baski_yogunluk,
        otomatik_barkod: body.otomatik_barkod,
        updated_at: new Date().toISOString(),
      })
      .eq("sube", body.sube)
      .select()
      .single()
    result = { data, error }
  } else {
    // Insert
    const { data, error } = await supabase
      .from("sube_ayarlar")
      .insert({
        sube: body.sube,
        peron_no: body.peron_no,
        sirket_telefon: body.sirket_telefon,
        yazici_model: body.yazici_model,
        yazici_port: body.yazici_port,
        yazici_ip: body.yazici_ip,
        baglanti_tipi: body.baglanti_tipi,
        barkod_genislik: body.barkod_genislik,
        barkod_yukseklik: body.barkod_yukseklik,
        baski_hiz: body.baski_hiz,
        baski_yogunluk: body.baski_yogunluk,
        otomatik_barkod: body.otomatik_barkod,
      })
      .select()
      .single()
    result = { data, error }
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ ayarlar: result.data })
}
