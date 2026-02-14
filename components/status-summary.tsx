"use client"

import type { Cargo } from "@/lib/cargo-data"

interface StatusSummaryProps {
  cargos: Cargo[]
  kasaTutari: number
}

export function StatusSummary({ cargos, kasaTutari }: StatusSummaryProps) {
  const yuklenecekCount = cargos.filter((c) => c.status === "yuklenecek").length
  const yoldaCount = cargos.filter((c) => c.status === "yolda").length
  const gidenCount = cargos.filter((c) => c.status === "giden").length
  const devirCount = cargos.filter((c) => c.status === "devir").length

  const items = [
    { label: "Yuklenecek", count: yuklenecekCount, color: "bg-emerald-50 text-cargo-green border-cargo-green" },
    { label: "Yolda", count: yoldaCount, color: "bg-emerald-50 text-cargo-green border-cargo-green" },
    { label: "Giden", count: gidenCount, color: "bg-emerald-50 text-cargo-dark border-cargo-dark" },
    { label: "Devir", count: devirCount, color: "bg-orange-50 text-cargo-orange border-cargo-orange" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-3 rounded-md border px-4 py-2 ${item.color}`}
        >
          <span className="text-sm font-medium">{item.label}</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cargo-green text-xs font-bold text-white">
            {item.count}
          </span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-3 rounded-md border border-border bg-card px-4 py-2">
        <span className="text-sm font-medium text-foreground">Anlik Kasa Tutari</span>
        <span className="rounded bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
          {kasaTutari.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
