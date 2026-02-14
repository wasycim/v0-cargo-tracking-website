import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { telefon, kod } = await request.json()

    if (!telefon || !kod) {
      return NextResponse.json({ error: "Telefon ve kod gerekli" }, { status: 400 })
    }

    const cleanPhone = telefon.replace(/\s/g, "")
    const supabase = await createClient()

    const { data } = await supabase
      .from("sms_kodlari")
      .select("*")
      .eq("telefon", cleanPhone)
      .eq("kod", kod)
      .eq("kullanildi", false)
      .single()

    if (!data) {
      return NextResponse.json({ success: false, error: "Kod hatal\u0131 veya s\u00fcresi dolmu\u015f" })
    }

    // 5 dakikadan eski kodlari kabul etme
    const createdAt = new Date(data.created_at).getTime()
    const now = Date.now()
    if (now - createdAt > 5 * 60 * 1000) {
      return NextResponse.json({ success: false, error: "Kodun s\u00fcresi dolmu\u015f, yeni kod g\u00f6nderin" })
    }

    // Kodu kullanildi olarak isaretle
    await supabase
      .from("sms_kodlari")
      .update({ kullanildi: true })
      .eq("telefon", cleanPhone)
      .eq("kod", kod)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] SMS verify error:", error)
    return NextResponse.json({ error: "Do\u011frulama ba\u015far\u0131s\u0131z" }, { status: 500 })
  }
}
