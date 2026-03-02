import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { tc_no, sifre } = await request.json()

    if (!tc_no || !sifre) {
      return NextResponse.json({ error: "TC Kimlik No ve şifre gereklidir" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("kullanicilar")
      .select("*")
      .eq("tc_no", tc_no)
      .eq("aktif", true)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "TC Kimlik No veya şifre hatalı" }, { status: 401 })
    }

    // Simple password check (plain text as stored by admin in DB)
    if (data.sifre !== sifre) {
      return NextResponse.json({ error: "TC Kimlik No veya şifre hatalı" }, { status: 401 })
    }

    // IP adresini al
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "bilinmiyor"

    // Giris logunu kaydet
    await supabase.from("user_logs").insert({
      kullanici_id: data.id,
      kullanici_ad: data.ad,
      kullanici_soyad: data.soyad,
      sube: data.sube,
      islem_tipi: "giris",
      ip_adresi: ip,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        tc_no: data.tc_no,
        ad: data.ad,
        soyad: data.soyad,
        telefon: data.telefon,
        sube: data.sube,
        sube_kodu: data.sube_kodu || "",
      },
    })
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
