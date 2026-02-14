"use client"

import type { Cargo } from "@/lib/cargo-data"

interface StatusSummaryProps {
  cargos: Cargo[]
  kasaTutari: number
}

export function StatusSummary({ cargos, kasaTutari }: StatusSummaryProps) {
  const yuklenecekCount = cargos.filter((c) => c.status === "yuklenecek").length
  const gidenCount = cargos.filter((c) => c.status === "giden").length
  const iptalCount = cargos.filter((c) => c.status === "iptal").length

  const items = [
    { label: "Yüklenecek", count: yuklenecekCount, borderColor: "border-cargo-green", badgeBg: "bg-cargo-green" },
    { label: "Giden", count: gidenCount, borderColor: "border-cargo-dark", badgeBg: "bg-cargo-dark" },
    { label: "İptal", count: iptalCount, borderColor: "border-red-500", badgeBg: "bg-red-500" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-3 rounded-md border bg-card px-4 py-2 ${item.borderColor}`}
        >
          <span className="text-sm font-medium text-foreground">{item.label}</span>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${item.badgeBg}`}>
            {item.count}
          </span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-3 rounded-md border border-border bg-card px-4 py-2">
        <span className="text-sm font-medium text-foreground">Anlık Kasa Tutarı</span>
        <span className="rounded bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {kasaTutari.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
