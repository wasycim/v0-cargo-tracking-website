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
  const iptalCount = cargos.filter((c) => c.status === "iptal").length

  const chartData = useMemo(() => {
    const dateMap: Record<string, { tutar: number; adet: number }> = {}

    for (let i = 30; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })
      dateMap[key] = { tutar: 0, adet: 0 }
    }

    cargos.forEach((c) => {
      if (c.departureDate && c.status !== "iptal") {
        const parts = c.departureDate.split(".")
        if (parts.length >= 2) {
          const key = `${parts[0]}.${parts[1]}`
          if (dateMap[key]) {
            dateMap[key].tutar += c.amount
            dateMap[key].adet += 1
          } else {
            dateMap[key] = { tutar: c.amount, adet: 1 }
          }
        }
      }
    })

    return Object.entries(dateMap)
      .map(([tarih, data]) => ({ tarih, ...data }))
      .slice(-30)
  }, [cargos])

  return (
    <div className="p-4">
      {/* Status Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Yuklenecek", count: yuklenecekCount, border: "border-cargo-green", badge: "bg-cargo-green" },
          { label: "Giden", count: gidenCount, border: "border-cargo-dark", badge: "bg-cargo-dark" },
          { label: "Iptal", count: iptalCount, border: "border-red-500", badge: "bg-red-500" },
        ].map((item) => (
          <div key={item.label} className={`flex items-center justify-between rounded-lg border-2 bg-card px-4 py-3 ${item.border}`}>
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${item.badge}`}>
              {item.count}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg border-2 border-border bg-card px-4 py-3">
          <span className="text-sm font-medium text-foreground">Anlik Kasa Tutari</span>
          <span className="rounded-md bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {kasaTutari.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Tutar Chart (top - area) */}
      <div className="mb-4 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Tutar Grafigi (TL)</h3>
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

      {/* Adet Chart (bottom - line) */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Adet Grafigi</h3>
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
