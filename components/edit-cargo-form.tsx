"use client"

import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CityPicker } from "@/components/city-picker"
import type { Cargo } from "@/lib/cargo-data"

interface EditCargoFormProps {
  cargo: Cargo
  onClose: () => void
  onSubmit: (cargoId: string, data: Partial<Cargo>) => void
}

export function EditCargoForm({ cargo, onClose, onSubmit }: EditCargoFormProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const [sender, setSender] = useState(cargo.sender.replace(/\n/g, " "))
  const [receiver, setReceiver] = useState(cargo.receiver.replace(/\n/g, " "))
  const [to, setTo] = useState(cargo.to)
  const [toCity, setToCity] = useState(cargo.toCity)
  const [pieces, setPieces] = useState(String(cargo.pieces))
  const [amount, setAmount] = useState(String(cargo.amount))

  // Otobüs / Araç bilgileri
  const [plate, setPlate] = useState(cargo.plate || "")
  const [firma, setFirma] = useState(cargo.firma || "")
  const [aracTelefon, setAracTelefon] = useState(cargo.aracTelefon || "")
  const [departureTime, setDepartureTime] = useState(cargo.departureTime || "")
  const [arrivalTime, setArrivalTime] = useState(cargo.arrivalTime || "")

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(onClose, 250)
  }

  const handleSubmit = () => {
    onSubmit(cargo.id, {
      sender,
      receiver,
      to,
      toCity,
      pieces: Number(pieces) || 1,
      amount: Number(amount) || 0,
      plate,
      firma,
      aracTelefon,
      departureTime,
      arrivalTime,
    })
    handleClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 transition-all duration-250 ease-out ${
        isVisible && !isClosing ? "bg-black/40 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className={`my-auto w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl transition-all duration-250 ease-out ${
          isVisible && !isClosing
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Kargo Bilgileri Düzenle - {cargo.trackingNo}</h3>
          <button onClick={handleClose} className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label="Kapat">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Gönderici</label>
            <Input placeholder="Gönderici adı" value={sender} onChange={(e) => setSender(e.target.value)} className="border-border bg-background" />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Alıcı</label>
            <Input placeholder="Alıcı adı" value={receiver} onChange={(e) => setReceiver(e.target.value)} className="border-border bg-background" />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Varış Yeri (İl / İlçe)</label>
            <CityPicker
              value={to}
              onChange={(val) => {
                setTo(val)
                const parts = val.split("/")
                setToCity(parts.length > 1 ? parts[1].trim() : parts[0].trim())
              }}
            />
          </div>

          <div className="mb-3 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Parça Sayısı</label>
              <Input type="number" min={1} value={pieces} onChange={(e) => setPieces(e.target.value)} className="border-border bg-background" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Tutar (TL)</label>
              <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className="border-border bg-background" />
            </div>
          </div>

          {/* Otobüs / Araç Bilgileri */}
          <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3">
            <h4 className="mb-3 text-xs font-semibold text-muted-foreground">Otobüs / Araç Bilgileri</h4>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Firma</label>
              <Input placeholder="Taşıma firması" value={firma} onChange={(e) => setFirma(e.target.value)} className="border-border bg-background" />
            </div>

            <div className="mb-3 flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Plaka</label>
                <Input placeholder="Araç plakası" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} className="border-border bg-background" />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Araç Telefon</label>
                <Input placeholder="5XX XXX XX XX" value={aracTelefon} onChange={(e) => setAracTelefon(e.target.value.replace(/\D/g, "").slice(0, 10))} className="border-border bg-background" maxLength={10} />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Kalkış Saati</label>
                <Input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="border-border bg-background" />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Varış Saati</label>
                <Input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="border-border bg-background" />
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} className="flex w-full items-center justify-center gap-2 rounded-md bg-cargo-green py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cargo-dark">
            <Save className="h-4 w-4" />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
