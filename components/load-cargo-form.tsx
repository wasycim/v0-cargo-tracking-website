"use client"

import { useState, useEffect } from "react"
import { X, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"

interface LoadCargoFormProps {
  cargoId: string
  trackingNo: string
  onClose: () => void
  onSubmit: (cargoId: string, data: { firma: string; kalkisSaati: string; varisSaati: string; plaka: string }) => void
}

export function LoadCargoForm({ cargoId, trackingNo, onClose, onSubmit }: LoadCargoFormProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const [firma, setFirma] = useState("")
  const [kalkisSaati, setKalkisSaati] = useState("")
  const [varisSaati, setVarisSaati] = useState("")
  const [plaka, setPlaka] = useState("")

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(onClose, 250)
  }

  const handleSubmit = () => {
    if (!firma || !kalkisSaati || !varisSaati || !plaka) {
      alert("Lutfen tum alanlari doldurun")
      return
    }
    onSubmit(cargoId, { firma, kalkisSaati, varisSaati, plaka })
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
        className={`w-full max-w-md rounded-xl border border-border bg-card shadow-2xl transition-all duration-250 ease-out ${
          isVisible && !isClosing
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            Kargo Yukle - {trackingNo}
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
          <div className="mb-4 rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">Kalkis Yeri</span>
            <p className="text-sm font-semibold text-foreground">Izmit (Kocaeli) / Gebze</p>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Firma</label>
            <Input
              placeholder="Tasima firmasini girin"
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
              className="border-border bg-background"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Plaka</label>
            <Input
              placeholder="Arac plakasi"
              value={plaka}
              onChange={(e) => setPlaka(e.target.value.toUpperCase())}
              className="border-border bg-background"
            />
          </div>

          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Kalkis Saati</label>
              <Input
                type="time"
                value={kalkisSaati}
                onChange={(e) => setKalkisSaati(e.target.value)}
                className="border-border bg-background"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Varis Saati</label>
              <Input
                type="time"
                value={varisSaati}
                onChange={(e) => setVarisSaati(e.target.value)}
                className="border-border bg-background"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-cargo-green py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cargo-dark"
          >
            <Truck className="h-4 w-4" />
            Yukle
          </button>
        </div>
      </div>
    </div>
  )
}
