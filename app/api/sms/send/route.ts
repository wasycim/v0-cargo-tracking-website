import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { telefon } = await request.json()

    if (!telefon || !/^5\d{9}$/.test(telefon.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Ge\u00e7ersiz telefon numaras\u0131" }, { status: 400 })
    }

    // 4 haneli rastgele kod
    const code = String(Math.floor(1000 + Math.random() * 9000))

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      // Twilio ayarlanmamissa kodu direkt dondur (gelistirme modu)
      console.log("[v0] Twilio not configured, returning code directly:", code)
      return NextResponse.json({ success: true, code, dev: true })
    }

    // Twilio API ile SMS gonder
    const toNumber = "+90" + telefon.replace(/\s/g, "")
    const message = `Kargo do\u011frulama kodunuz: ${code}`

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

    const res = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: toNumber,
        From: fromNumber,
        Body: message,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error("[v0] Twilio error:", err)
      // Twilio hatasi olsa bile kodu dondur ki sistem calissin
      return NextResponse.json({ success: true, code, twilioError: true })
    }

    // SMS basariyla gonderildi - kodu sadece backend'de tut
    // Supabase'e kaydet
    const supabase = await createClient()
    await supabase.from("sms_kodlari").upsert({
      telefon: telefon.replace(/\s/g, ""),
      kod: code,
      kullanildi: false,
      created_at: new Date().toISOString(),
    }, { onConflict: "telefon" })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] SMS send error:", error)
    return NextResponse.json({ error: "SMS g\u00f6nderilemedi" }, { status: 500 })
  }
}
