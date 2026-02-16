import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { telefon } = await req.json()
    if (!telefon) {
      return NextResponse.json({ error: "Telefon numarasi gerekli" }, { status: 400 })
    }

    // 6 haneli kod uret
    const code = String(Math.floor(100000 + Math.random() * 900000))

    // Supabase'e kaydet (upsert - ayni numaraya yeni kod)
    const supabase = await createClient()
    const { error: dbError } = await supabase.from("sms_kodlari").upsert({
      telefon: telefon.replace(/\s/g, ""),
      kod: code,
      kullanildi: false,
      created_at: new Date().toISOString(),
    }, { onConflict: "telefon" })

    if (dbError) {
      console.error("SMS kod kayit hatasi:", dbError)
      return NextResponse.json({ error: "Kod olusturulamadi" }, { status: 500 })
    }

    // Twilio ile SMS gondermeyi dene
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (accountSid && authToken && fromNumber) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
        const res = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + Buffer.from(accountSid + ":" + authToken).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: "+90" + telefon.replace(/\s/g, ""),
            From: fromNumber,
            Body: "Kargo dogrulama kodunuz: " + code,
          }).toString(),
        })

        if (res.ok) {
          // SMS basariyla gonderildi - kodu gosterme
          return NextResponse.json({ success: true })
        }

        // Twilio hatasi - dev moduna dus
        const err = await res.json()
        console.error("Twilio error:", err)
      } catch (e) {
        console.error("Twilio fetch error:", e)
      }
    }

    // Twilio yoksa veya hata verdiyse - kodu dogrudan goster (dev modu)
    return NextResponse.json({ success: true, devCode: code })
  } catch {
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 })
  }
}
