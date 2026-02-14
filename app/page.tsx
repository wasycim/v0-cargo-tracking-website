"use client"

import { useState, useMemo, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { ActionButtonsBar } from "@/components/action-buttons"
import { StatusSummary } from "@/components/status-summary"
import { FilterBar } from "@/components/filter-bar"
import { CargoTable } from "@/components/cargo-table"
import { NewCargoForm } from "@/components/new-cargo-form"
import { LoadCargoForm } from "@/components/load-cargo-form"
import { mockCargos } from "@/lib/cargo-data"
import type { Cargo } from "@/lib/cargo-data"

export default function Page() {
  const [showNewCargoForm, setShowNewCargoForm] = useState(false)
  const [loadingCargo, setLoadingCargo] = useState<{ id: string; trackingNo: string } | null>(null)
  const [cargos, setCargos] = useState<Cargo[]>(mockCargos)
  const [filters, setFilters] = useState({
    yolda: true,
    devir: true,
    giden: true,
    eskiAktif: false,
    teslim: false,
    iptal: false,
  })

  const filteredCargos = useMemo(() => {
    return cargos.filter((cargo) => {
      if (cargo.status === "yuklenecek") return true
      if (cargo.status === "yolda" && !filters.yolda) return false
      if (cargo.status === "devir" && !filters.devir) return false
      if (cargo.status === "giden" && !filters.giden) return false
      if (cargo.status === "teslim" && !filters.teslim) return false
      if (cargo.status === "iptal" && !filters.iptal) return false
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
    (cargoId: string, data: { firma: string; kalkisSaati: string; varisSaati: string; plaka: string }) => {
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

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <ActionButtonsBar onNewCargo={() => setShowNewCargoForm(true)} />
      <StatusSummary cargos={cargos} kasaTutari={kasaTutari} />
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      <CargoTable cargos={filteredCargos} onLoadCargo={handleLoadCargo} />

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
    </main>
  )
}
