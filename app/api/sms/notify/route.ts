import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { telefonlar, mesaj } = await req.json()

    if (!telefonlar || !Array.isArray(telefonlar) || telefonlar.length === 0 || !mesaj) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      console.log("[v0] Twilio not configured, skipping SMS notify. Message:", mesaj)
      return NextResponse.json({ success: true, dev: true })
    }

    const results = []

    for (const tel of telefonlar) {
      const cleanTel = tel.replace(/\s/g, "")
      const toNumber = cleanTel.startsWith("+90") ? cleanTel : `+90${cleanTel}`

      try {
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: toNumber,
              From: fromNumber,
              Body: mesaj,
            }),
          }
        )

        if (!res.ok) {
          const err = await res.json()
          console.error("[v0] Twilio notify error for", toNumber, ":", err)
          results.push({ tel, success: false, error: err.message })
        } else {
          results.push({ tel, success: true })
        }
      } catch (e) {
        console.error("[v0] Twilio notify fetch error:", e)
        results.push({ tel, success: false })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch {
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 })
  }
}
