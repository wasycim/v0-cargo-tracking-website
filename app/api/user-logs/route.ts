import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const kullanici_id = searchParams.get("kullanici_id")

    if (!kullanici_id) {
      return NextResponse.json({ error: "kullanici_id gereklidir" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_logs")
      .select("*")
      .eq("kullanici_id", kullanici_id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: "Loglar yüklenemedi" }, { status: 500 })
    }

    return NextResponse.json({ logs: data || [] })
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { kullanici_id, kullanici_ad, kullanici_soyad, sube, islem_tipi, ip_adresi } = body

    if (!kullanici_id || !kullanici_ad || !sube || !islem_tipi) {
      return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("user_logs").insert({
      kullanici_id,
      kullanici_ad,
      kullanici_soyad: kullanici_soyad || "",
      sube,
      islem_tipi,
      ip_adresi: ip_adresi || null,
    })

    if (error) {
      return NextResponse.json({ error: "Log kaydedilemedi" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
