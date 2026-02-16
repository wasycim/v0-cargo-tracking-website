"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import type { Cargo } from "@/lib/cargo-data"

interface AnaSayfaProps {
  cargos: Cargo[]
  kasaTutari: number
}

export function AnaSayfa({ cargos, kasaTutari }: AnaSayfaProps) {
  const yuklenecekCount = cargos.filter((c) => c.status === "yuklenecek").length
  const gidenCount = cargos.filter((c) => c.status === "giden").length
  const gonderildiCount = cargos.filter((c) => c.status === "gonderildi").length
  const iptalCount = cargos.filter((c) => c.status === "iptal").length

  const chartData = useMemo(() => {
    // Son 14 gun icin sabit tarih listesi olustur (unique, siralanmis)
    const days: { key: string; label: string }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0] // "2026-02-16" - unique key
      const label = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }) // "16.02" - display
      days.push({ key, label })
    }

    // Her gun icin tutar ve adet hesapla
    const dataMap: Record<string, { tutar: number; adet: number }> = {}
    days.forEach((d) => { dataMap[d.key] = { tutar: 0, adet: 0 } })

    cargos.forEach((c) => {
      if (c.status === "iptal") return

      let cargoDateKey: string | null = null

      if (c.departureDate) {
        // "DD.MM.YYYY" -> "YYYY-MM-DD"
        const parts = c.departureDate.split(".")
        if (parts.length === 3) {
          cargoDateKey = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      } else if (c.createdAt) {
        cargoDateKey = new Date(c.createdAt).toISOString().split("T")[0]
      }

      if (cargoDateKey && dataMap[cargoDateKey]) {
        dataMap[cargoDateKey].tutar += c.amount
        dataMap[cargoDateKey].adet += 1
      }
    })

    return days.map((d) => ({
      tarih: d.label,
      tutar: dataMap[d.key].tutar,
      adet: dataMap[d.key].adet,
    }))
  }, [cargos])

  return (
    <div className="p-4">
      {/* Status Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Y\u00fcklenecek", count: yuklenecekCount, border: "border-cargo-green", badge: "bg-cargo-green" },
          { label: "Giden", count: gidenCount, border: "border-cargo-dark", badge: "bg-cargo-dark" },
          { label: "G\u00f6nderildi", count: gonderildiCount, border: "border-blue-600", badge: "bg-blue-600" },
          { label: "\u0130ptal", count: iptalCount, border: "border-red-500", badge: "bg-red-500" },
        ].map((item) => (
          <div key={item.label} className={`flex items-center justify-between rounded-lg border-2 bg-card px-4 py-3 ${item.border}`}>
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${item.badge}`}>
              {item.count}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg border-2 border-border bg-card px-4 py-3">
          <span className="text-sm font-medium text-foreground">{"Anl\u0131k Kasa"}</span>
          <span className="rounded-md bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {kasaTutari.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Tutar Chart */}
      <div className="mb-4 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">{"Tutar Grafi\u011fi (TL)"}</h3>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="tarih" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
                formatter={(val: number) => [`${val.toLocaleString("tr-TR")} TL`, "Tutar"]}
              />
              <Area
                type="monotone"
                dataKey="tutar"
                name="Tutar"
                stroke="hsl(200, 70%, 50%)"
                fill="hsl(200, 70%, 50%)"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(200, 70%, 50%)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Adet Chart */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">{"Adet Grafi\u011fi"}</h3>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="tarih" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "hsl(var(--foreground))",
                }}
                formatter={(val: number) => [val, "Adet"]}
              />
              <Line
                type="monotone"
                dataKey="adet"
                name="Adet"
                stroke="hsl(200, 70%, 60%)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(200, 70%, 60%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
