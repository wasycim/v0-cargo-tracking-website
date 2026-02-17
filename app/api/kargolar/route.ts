import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - şubeye göre kargoları getir
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sube = searchParams.get("sube")

  if (!sube) {
    return NextResponse.json({ error: "Şube parametresi gerekli" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("kargolar")
    .select("*")
    .eq("sube", sube)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map DB fields to frontend Cargo interface
  const validStatuses = ["yuklenecek", "giden", "gonderildi", "teslim", "iptal"]
  const cargos = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id,
    status: validStatuses.includes(row.status as string) ? row.status : "yuklenecek",
    trackingNo: row.tracking_no,
    pieces: row.pieces,
    sender: row.sender,
    senderTelefon: row.sender_telefon,
    receiver: row.receiver,
    receiverTelefon: row.receiver_telefon,
    from: row.from_location,
    fromCity: row.from_city,
    to: row.to_location,
    toCity: row.to_city,
    amount: Number(row.amount),
    departureDate: row.departure_date || "",
    departureTime: row.departure_time || "",
    arrivalDate: row.arrival_date || "",
    arrivalTime: row.arrival_time || "",
    plate: row.plate || "",
    firma: row.firma || "",
    aracTelefon: row.arac_telefon || "",
    gonderimTipi: row.gonderim_tipi || "ah",
    odemeTipi: row.odeme_tipi || "pesin",
    createdAt: row.created_at,
  }))

  return NextResponse.json({ cargos })
}

// POST - yeni kargo ekle
export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from("kargolar")
    .insert({
      kullanici_id: body.kullanici_id || null,
      sube: body.sube,
      status: body.status || "yuklenecek",
      tracking_no: body.trackingNo,
      pieces: body.pieces,
      sender: body.sender,
      sender_telefon: body.senderTelefon || null,
      receiver: body.receiver,
      receiver_telefon: body.receiverTelefon || null,
      from_location: body.from,
      from_city: body.fromCity,
      to_location: body.to,
      to_city: body.toCity,
      amount: body.amount,
      departure_date: body.departureDate || null,
      departure_time: body.departureTime || null,
      arrival_date: body.arrivalDate || null,
      arrival_time: body.arrivalTime || null,
      plate: body.plate || null,
      firma: body.firma || null,
      arac_telefon: body.aracTelefon || null,
      gonderim_tipi: body.gonderimTipi || "ah",
      odeme_tipi: body.odemeTipi || "pesin",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    cargo: {
      id: data.id,
      status: data.status,
      trackingNo: data.tracking_no,
      pieces: data.pieces,
      sender: data.sender,
      senderTelefon: data.sender_telefon,
      receiver: data.receiver,
      receiverTelefon: data.receiver_telefon,
      from: data.from_location,
      fromCity: data.from_city,
      to: data.to_location,
      toCity: data.to_city,
      amount: Number(data.amount),
      departureDate: data.departure_date || "",
      departureTime: data.departure_time || "",
      arrivalDate: data.arrival_date || "",
      arrivalTime: data.arrival_time || "",
      plate: data.plate || "",
      firma: data.firma || "",
      aracTelefon: data.arac_telefon || "",
      gonderimTipi: data.gonderim_tipi || "ah",
      odemeTipi: data.odeme_tipi || "pesin",
      createdAt: data.created_at,
    },
  })
}

// PATCH - kargo güncelle
export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: "Kargo ID gerekli" }, { status: 400 })
  }

  // Map frontend fields to DB fields
  const dbUpdates: Record<string, unknown> = {}
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.trackingNo !== undefined) dbUpdates.tracking_no = updates.trackingNo
  if (updates.pieces !== undefined) dbUpdates.pieces = updates.pieces
  if (updates.sender !== undefined) dbUpdates.sender = updates.sender
  if (updates.senderTelefon !== undefined) dbUpdates.sender_telefon = updates.senderTelefon
  if (updates.receiver !== undefined) dbUpdates.receiver = updates.receiver
  if (updates.receiverTelefon !== undefined) dbUpdates.receiver_telefon = updates.receiverTelefon
  if (updates.from !== undefined) dbUpdates.from_location = updates.from
  if (updates.fromCity !== undefined) dbUpdates.from_city = updates.fromCity
  if (updates.to !== undefined) dbUpdates.to_location = updates.to
  if (updates.toCity !== undefined) dbUpdates.to_city = updates.toCity
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount
  if (updates.departureDate !== undefined) dbUpdates.departure_date = updates.departureDate
  if (updates.departureTime !== undefined) dbUpdates.departure_time = updates.departureTime
  if (updates.arrivalDate !== undefined) dbUpdates.arrival_date = updates.arrivalDate
  if (updates.arrivalTime !== undefined) dbUpdates.arrival_time = updates.arrivalTime
  if (updates.plate !== undefined) dbUpdates.plate = updates.plate
  if (updates.firma !== undefined) dbUpdates.firma = updates.firma
  if (updates.aracTelefon !== undefined) dbUpdates.arac_telefon = updates.aracTelefon
  if (updates.gonderimTipi !== undefined) dbUpdates.gonderim_tipi = updates.gonderimTipi
  if (updates.odemeTipi !== undefined) dbUpdates.odeme_tipi = updates.odemeTipi

  const { error } = await supabase
    .from("kargolar")
    .update(dbUpdates)
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
