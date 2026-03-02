import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { kullanici_id, kullanici_ad, kullanici_soyad, sube } = await request.json()

    if (!kullanici_id || !kullanici_ad || !sube) {
      return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 })
    }

    // IP adresini al
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "bilinmiyor"

    const supabase = await createClient()

    await supabase.from("user_logs").insert({
      kullanici_id,
      kullanici_ad,
      kullanici_soyad: kullanici_soyad || "",
      sube,
      islem_tipi: "cikis",
      ip_adresi: ip,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 })
  }
}
