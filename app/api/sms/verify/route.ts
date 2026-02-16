import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { telefon, kod } = await req.json()
    if (!telefon || !kod) {
      return NextResponse.json({ error: "Telefon ve kod gerekli" }, { status: 400 })
    }

    const supabase = await createClient()
    const cleanPhone = telefon.replace(/\s/g, "")

    // Kodu kontrol et
    const { data, error } = await supabase
      .from("sms_kodlari")
      .select("*")
      .eq("telefon", cleanPhone)
      .eq("kullanildi", false)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Kod bulunamadi, yeni kod gonderin" }, { status: 400 })
    }

    // 5 dakika suresi var
    const createdAt = new Date(data.created_at).getTime()
    const now = Date.now()
    if (now - createdAt > 5 * 60 * 1000) {
      return NextResponse.json({ error: "Kodun suresi doldu, yeni kod gonderin" }, { status: 400 })
    }

    // Kodu karsilastir
    if (data.kod !== kod) {
      return NextResponse.json({ error: "Kod hatali, tekrar deneyin" }, { status: 400 })
    }

    // Kodu kullanildi olarak isaretle
    await supabase
      .from("sms_kodlari")
      .update({ kullanildi: true })
      .eq("telefon", cleanPhone)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 })
  }
}
