import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { telefon } = await req.json()
    if (!telefon) {
      return NextResponse.json({ error: "Telefon numarasi gerekli" }, { status: 400 })
    }

    const cleanPhone = telefon.replace(/\s/g, "")
    const code = String(Math.floor(100000 + Math.random() * 900000))

    const supabase = await createClient()

    // Eski pending kayitlari iptal et
    await supabase
      .from("otp_requests")
      .update({ status: "expired" })
      .eq("phone_number", cleanPhone)
      .eq("status", "pending")

    // Yeni OTP kaydi olustur - Python WhatsApp botu bunu dinleyip mesaj atacak
    const { error } = await supabase
      .from("otp_requests")
      .insert({
        phone_number: cleanPhone,
        otp_code: code,
        status: "pending",
      })

    if (error) {
      console.error("OTP insert error:", error)
      return NextResponse.json({ error: "Kod olusturulamadi" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 })
  }
}
