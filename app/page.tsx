"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Package, Ban } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { StatusSummary } from "@/components/status-summary"
import { FilterBar } from "@/components/filter-bar"
import { CargoTable } from "@/components/cargo-table"
import { NewCargoForm } from "@/components/new-cargo-form"
import { LoadCargoForm } from "@/components/load-cargo-form"
import { EditCargoForm } from "@/components/edit-cargo-form"
import { CancelCargoForm } from "@/components/cancel-cargo-form"
import { mockCargos } from "@/lib/cargo-data"
import type { Cargo } from "@/lib/cargo-data"

export default function Page() {
  const [showNewCargoForm, setShowNewCargoForm] = useState(false)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [loadingCargo, setLoadingCargo] = useState<{ id: string; trackingNo: string } | null>(null)
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null)
  const [cargos, setCargos] = useState<Cargo[]>(mockCargos)
  const [filters, setFilters] = useState({
    yolda: true,
    devir: true,
    giden: true,
    eskiAktif: false,
    iptal: false,
  })

  // Auto-hide cargos at 03:00 each day
  useEffect(() => {
    const checkTime = () => {
      const now = new Date()
      if (now.getHours() === 3 && now.getMinutes() === 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setCargos((prev) =>
          prev.map((c) => {
            if (c.createdAt) {
              const created = new Date(c.createdAt)
              if (created < today && c.status !== "iptal" && c.status !== "teslim") {
                return { ...c, status: "teslim" as const }
              }
            }
            return c
          })
        )
      }
    }
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredCargos = useMemo(() => {
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    return cargos.filter((cargo) => {
      // Filter out old cargos unless eskiAktif is checked
      if (!filters.eskiAktif && cargo.createdAt) {
        const created = new Date(cargo.createdAt)
        if (created < oneMonthAgo) return false
      }

      if (cargo.status === "yuklenecek") return true
      if (cargo.status === "yolda" && !filters.yolda) return false
      if (cargo.status === "devir" && !filters.devir) return false
      if (cargo.status === "giden" && !filters.giden) return false
      if (cargo.status === "iptal" && !filters.iptal) return false
      if (cargo.status === "teslim") return false
      return true
    })
  }, [filters, cargos])

  const handleFilterChange = (key: string, value: boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const kasaTutari = useMemo(() => {
    return filteredCargos.reduce((sum, cargo) => sum + cargo.amount, 0)
  }, [filteredCargos])

  const handleNewCargoSubmit = useCallback((newCargo: Cargo) => {
    setCargos((prev) => [newCargo, ...prev])
  }, [])

  const handleLoadCargo = useCallback((cargoId: string, trackingNo: string) => {
    setLoadingCargo({ id: cargoId, trackingNo })
  }, [])

  const handleLoadSubmit = useCallback(
    (cargoId: string, data: { firma: string; kalkisSaati: string; varisSaati: string; plaka: string; aracTelefon: string }) => {
      const now = new Date()
      const dateStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
      setCargos((prev) =>
        prev.map((c) =>
          c.id === cargoId
            ? {
                ...c,
                status: "giden" as const,
                departureTime: data.kalkisSaati,
                departureDate: dateStr,
                arrivalTime: data.varisSaati,
                arrivalDate: dateStr,
                plate: data.plaka,
              }
            : c
        )
      )
      setLoadingCargo(null)
    },
    []
  )

  const handleEditSubmit = useCallback(
    (cargoId: string, data: Partial<Cargo>) => {
      setCargos((prev) =>
        prev.map((c) => (c.id === cargoId ? { ...c, ...data } : c))
      )
      setEditingCargo(null)
    },
    []
  )

  const handleCancelCargo = useCallback((cargoId: string) => {
    setCargos((prev) =>
      prev.map((c) => (c.id === cargoId ? { ...c, status: "iptal" as const } : c))
    )
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Action Bar - Yeni Kargo + Iptal */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button
          onClick={() => setShowNewCargoForm(true)}
          className="flex items-center gap-2 rounded-lg border-2 border-cargo-green bg-cargo-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cargo-dark hover:shadow-md active:scale-95"
        >
          <Package className="h-5 w-5" />
          Yeni Kargo
        </button>
        <button
          onClick={() => setShowCancelForm(true)}
          className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-card px-5 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive hover:text-white active:scale-95"
        >
          <Ban className="h-4 w-4" />
          Kargo Iptal
        </button>
      </div>

      <StatusSummary cargos={cargos} kasaTutari={kasaTutari} />
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      <CargoTable
        cargos={filteredCargos}
        onLoadCargo={handleLoadCargo}
        onEditCargo={setEditingCargo}
      />

      {showNewCargoForm && (
        <NewCargoForm
          onClose={() => setShowNewCargoForm(false)}
          onSubmit={handleNewCargoSubmit}
        />
      )}

      {loadingCargo && (
        <LoadCargoForm
          cargoId={loadingCargo.id}
          trackingNo={loadingCargo.trackingNo}
          onClose={() => setLoadingCargo(null)}
          onSubmit={handleLoadSubmit}
        />
      )}

      {editingCargo && (
        <EditCargoForm
          cargo={editingCargo}
          onClose={() => setEditingCargo(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {showCancelForm && (
        <CancelCargoForm
          cargos={cargos}
          onClose={() => setShowCancelForm(false)}
          onCancel={handleCancelCargo}
        />
      )}
    </main>
  )
}
