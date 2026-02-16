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

    // En son pending veya sent olan kodu bul
    const { data, error } = await supabase
      .from("otp_requests")
      .select("*")
      .eq("phone_number", cleanPhone)
      .in("status", ["pending", "sent"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Kod bulunamadi, yeni kod gonderin" }, { status: 400 })
    }

    // 5 dakika suresi var
    const createdAt = new Date(data.created_at).getTime()
    if (Date.now() - createdAt > 5 * 60 * 1000) {
      await supabase.from("otp_requests").update({ status: "expired" }).eq("id", data.id)
      return NextResponse.json({ error: "Kodun suresi doldu, yeni kod gonderin" }, { status: 400 })
    }

    // Kodu karsilastir
    if (data.otp_code !== kod) {
      return NextResponse.json({ error: "Kod hatali, tekrar deneyin" }, { status: 400 })
    }

    // Kodu dogrulandi olarak isaretle
    await supabase.from("otp_requests").update({ status: "verified" }).eq("id", data.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 })
  }
}
