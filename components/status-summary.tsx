"use client"

import type { Cargo } from "@/lib/cargo-data"
import type { AppPage } from "@/components/navigation"

interface StatusSummaryProps {
  cargos: Cargo[]
  kasaTutari: number
  onNavigate?: (page: AppPage) => void
}

export function StatusSummary({ cargos, kasaTutari, onNavigate }: StatusSummaryProps) {
  const yuklenecekCount = cargos.filter((c) => c.status === "yuklenecek").length
  const gidenCount = cargos.filter((c) => c.status === "giden").length
  const gonderildiCount = cargos.filter((c) => c.status === "gonderildi").length
  const iptalCount = cargos.filter((c) => c.status === "iptal").length

  const items: { label: string; count: number; borderColor: string; badgeBg: string; page?: AppPage }[] = [
    { label: "Y\u00fcklenecek", count: yuklenecekCount, borderColor: "border-cargo-green", badgeBg: "bg-cargo-green", page: "kargolar" },
    { label: "Giden", count: gidenCount, borderColor: "border-cargo-dark", badgeBg: "bg-cargo-dark", page: "kargolar" },
    { label: "G\u00f6nderildi", count: gonderildiCount, borderColor: "border-blue-600", badgeBg: "bg-blue-600", page: "gonderilenler" },
    { label: "\u0130ptal", count: iptalCount, borderColor: "border-red-500", badgeBg: "bg-red-500" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => item.page && onNavigate?.(item.page)}
          className={`flex items-center gap-3 rounded-md border bg-card px-4 py-2 transition-colors ${item.borderColor} ${item.page ? "cursor-pointer hover:bg-accent" : "cursor-default"}`}
        >
          <span className="text-sm font-medium text-foreground">{item.label}</span>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${item.badgeBg}`}>
            {item.count}
          </span>
        </button>
      ))}
      <div className="ml-auto flex items-center gap-3 rounded-md border border-border bg-card px-4 py-2">
        <span className="text-sm font-medium text-foreground">{"Anl\u0131k Kasa Tutar\u0131"}</span>
        <span className="rounded bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {kasaTutari.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
