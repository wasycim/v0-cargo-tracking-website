"use client"

import { useState, useEffect } from "react"
import { X, Ban, Search, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Cargo } from "@/lib/cargo-data"

interface CancelCargoFormProps {
  cargos: Cargo[]
  onClose: () => void
  onCancel: (cargoId: string) => void
}

export function CancelCargoForm({ cargos, onClose, onCancel }: CancelCargoFormProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [searchNo, setSearchNo] = useState("")
  const [foundCargo, setFoundCargo] = useState<Cargo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(onClose, 250)
  }

  const handleSearch = () => {
    const cleaned = searchNo.replace(/\s/g, "")
    const cargo = cargos.find((c) => c.trackingNo.replace(/\s/g, "") === cleaned && c.status !== "iptal")
    if (cargo) {
      setFoundCargo(cargo)
      setNotFound(false)
      setConfirmed(false)
    } else {
      setFoundCargo(null)
      setNotFound(true)
    }
  }

  const handleCancel = () => {
    if (!confirmed || !foundCargo) return
    onCancel(foundCargo.id)
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
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Ban className="h-4 w-4 text-destructive" />
            Kargo İptal
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
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Kargo Takip Numarası</label>
            <div className="flex gap-2">
              <Input
                placeholder="203 XXX XXX"
                value={searchNo}
                onChange={(e) => {
                  setSearchNo(e.target.value)
                  setFoundCargo(null)
                  setNotFound(false)
                  setConfirmed(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch()
                }}
                className="border-border bg-background"
              />
              <button
                onClick={handleSearch}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-cargo-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cargo-green"
              >
                <Search className="h-3.5 w-3.5" />
                Ara
              </button>
            </div>
          </div>

          {notFound && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Kargo bulunamadı veya zaten iptal edilmiş.
              </p>
            </div>
          )}

          {foundCargo && (
            <div className="mb-4 space-y-3">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Takip No</span>
                  <span className="text-sm font-semibold text-foreground">{foundCargo.trackingNo}</span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Gönderici</span>
                  <span className="text-sm text-foreground">{foundCargo.sender.replace(/\n/g, " ")}</span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Alıcı</span>
                  <span className="text-sm text-foreground">{foundCargo.receiver.replace(/\n/g, " ")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Tutar</span>
                  <span className="text-sm font-semibold text-foreground">
                    {foundCargo.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-50 px-4 py-3 dark:bg-amber-950/20">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded border-amber-500 accent-amber-600"
                />
                <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  Bu kargoyu iptal etmek istediğimi onaylıyorum
                </span>
              </label>

              <button
                onClick={handleCancel}
                disabled={!confirmed}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-destructive py-2.5 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-40"
              >
                <Ban className="h-4 w-4" />
                Kargoyu İptal Et
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
