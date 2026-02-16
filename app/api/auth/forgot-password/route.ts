import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { tc_no, telefon } = await request.json()

    if (!tc_no || !telefon) {
      return NextResponse.json({ error: "TC Kimlik No ve telefon numarasi gereklidir" }, { status: 400 })
    }

    if (tc_no.length !== 11) {
      return NextResponse.json({ error: "TC Kimlik No 11 haneli olmalidir" }, { status: 400 })
    }

    const supabase = await createClient()

    // TC ve telefon ile kullaniciyi bul
    const { data, error } = await supabase
      .from("kullanicilar")
      .select("ad, soyad, telefon, sifre, sube_kodu")
      .eq("tc_no", tc_no)
      .eq("aktif", true)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Bu bilgilere ait kullanici bulunamadi" }, { status: 404 })
    }

    // Telefon numarasini normalize et (bosluk ve tire kaldir)
    const dbTelefon = (data.telefon || "").replace(/[\s\-\(\)]/g, "")
    const girenTelefon = telefon.replace(/[\s\-\(\)]/g, "")

    // Telefon karsilastir (son 10 hane)
    const dbSon10 = dbTelefon.slice(-10)
    const girenSon10 = girenTelefon.slice(-10)

    if (dbSon10 !== girenSon10) {
      return NextResponse.json({ error: "Telefon numarasi kayitli bilgilerle uyusmuyor" }, { status: 401 })
    }

    // Sifreyi WhatsApp ile gonder - whatsapp_messages tablosuna yaz
    const mesaj = `KARGO TAKIP SISTEMI\n\nSayin ${data.ad} ${data.soyad},\n\nSifreniz: ${data.sifre}\n\nLutfen sifrenizi kimseyle paylasmayiniz.`

    const { error: wpError } = await supabase
      .from("whatsapp_messages")
      .insert({
        phone_number: girenSon10,
        message: mesaj,
        message_type: "password_reset",
        status: "pending",
        sube_kodu: data.sube_kodu || null,
      })

    if (wpError) {
      return NextResponse.json({ error: "Mesaj gonderilemedi, tekrar deneyin" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Sifreniz WhatsApp ile gonderildi",
    })
  } catch {
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 })
  }
}
