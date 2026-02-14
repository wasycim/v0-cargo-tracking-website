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
    })
    handleClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-250 ease-out ${
        isVisible && !isClosing ? "bg-black/40 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className={`w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl transition-all duration-250 ease-out ${
          isVisible && !isClosing
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            Yeni Kargo Bilgileri - {cargo.trackingNo}
          </h3>
          <button
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Gonderici</label>
            <Input
              placeholder="Gonderici adi"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="border-border bg-background"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Alici</label>
            <Input
              placeholder="Alici adi"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="border-border bg-background"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Varis Yeri (Il / Ilce)</label>
            <CityPicker
              value={to}
              onChange={(val) => {
                setTo(val)
                const parts = val.split("/")
                setToCity(parts.length > 1 ? parts[1].trim() : parts[0].trim())
              }}
            />
          </div>

          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Parca Sayisi</label>
              <Input
                type="number"
                min={1}
                value={pieces}
                onChange={(e) => setPieces(e.target.value)}
                className="border-border bg-background"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Tutar (TL)</label>
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-border bg-background"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-cargo-green py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cargo-dark"
          >
            <Save className="h-4 w-4" />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
