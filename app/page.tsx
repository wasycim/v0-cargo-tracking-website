"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { ActionButtonsBar } from "@/components/action-buttons"
import { StatusSummary } from "@/components/status-summary"
import { FilterBar } from "@/components/filter-bar"
import { CargoTable } from "@/components/cargo-table"
import { NewCargoForm } from "@/components/new-cargo-form"
import { mockCargos } from "@/lib/cargo-data"

export default function Page() {
  const [showNewCargoForm, setShowNewCargoForm] = useState(false)
  const [filters, setFilters] = useState({
    yolda: true,
    devir: true,
    giden: true,
    eskiAktif: false,
    teslim: false,
    iptal: false,
  })

  const filteredCargos = useMemo(() => {
    return mockCargos.filter((cargo) => {
      if (cargo.status === "yolda" && !filters.yolda) return false
      if (cargo.status === "devir" && !filters.devir) return false
      if (cargo.status === "giden" && !filters.giden) return false
      if (cargo.status === "yuklenecek") return true
      if (cargo.status === "teslim" && !filters.teslim) return false
      if (cargo.status === "iptal" && !filters.iptal) return false
      return true
    })
  }, [filters])

  const handleFilterChange = (key: string, value: boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const kasaTutari = useMemo(() => {
    return filteredCargos.reduce((sum, cargo) => sum + cargo.amount, 0)
  }, [filteredCargos])

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <ActionButtonsBar onNewCargo={() => setShowNewCargoForm(true)} />
      <StatusSummary cargos={mockCargos} kasaTutari={kasaTutari} />
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      <CargoTable cargos={filteredCargos} />

      {showNewCargoForm && (
        <NewCargoForm
          onClose={() => setShowNewCargoForm(false)}
          onSubmit={() => setShowNewCargoForm(false)}
        />
      )}
    </main>
  )
}
