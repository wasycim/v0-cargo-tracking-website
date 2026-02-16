import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { telefonlar, mesaj, sube_kodu } = await req.json()

    if (!telefonlar || !Array.isArray(telefonlar) || telefonlar.length === 0 || !mesaj) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 })
    }

    const supabase = await createClient()

    // Her numara icin whatsapp_messages tablosuna kayit ekle
    // Python WhatsApp botu bu tabloyu dinleyip mesajlari atacak
    const inserts = telefonlar.map((tel: string) => ({
      phone_number: tel.replace(/\s/g, ""),
      message: mesaj,
      message_type: "notification",
      status: "pending",
      sube_kodu: sube_kodu || null,
    }))

    const { error } = await supabase.from("whatsapp_messages").insert(inserts)

    if (error) {
      console.error("WhatsApp mesaj kayit hatasi:", error)
      return NextResponse.json({ error: "Mesaj kaydedilemedi" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 })
  }
}
