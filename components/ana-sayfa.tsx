"use client"

import { useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import type { Cargo } from "@/lib/cargo-data"

interface AnaSayfaProps {
  cargos: Cargo[]
  kasaTutari: number
}

// Generate mock sales data for the chart
const generateSalesData = () => {
  const data = []
  const startDate = new Date(2026, 0, 15)
  for (let i = 0; i < 31; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    data.push({
      tarih: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
      tutar: Math.floor(Math.random() * 35000) + 3000,
      adet: Math.floor(Math.random() * 35) + 5,
    })
  }
  return data
}

const generateNotifications = () => [
  { date: "13/02/2026 13:14", message: "Kasa bakiyeniz 24.750,00 TL'dir. Gun icerisinde odeme yapmaniz gerekmektedir." },
  { date: "12/02/2026 13:16", message: "Kasa bakiyeniz 15.300,00 TL'dir. Gun icerisinde odeme yapmaniz gerekmektedir." },
  { date: "11/02/2026 13:31", message: "Kasa bakiyeniz 18.600,00 TL'dir. Gun icerisinde odeme yapmaniz gerekmektedir." },
  { date: "10/02/2026 14:13", message: "Kasa bakiyeniz 20.630,00 TL'dir. Gun icerisinde odeme yapmaniz gerekmektedir." },
  { date: "09/02/2026 14:09", message: "Devir Kargolari icinde teslim edilip sisteme detay girilmeyen paket kalmasin lutfen." },
  { date: "09/02/2026 13:05", message: "Kasa bakiyeniz 32.900,00 TL'dir. Gun icerisinde odeme yapmaniz gerekmektedir." },
  { date: "06/02/2026 13:51", message: "Kasa bakiyeniz 21.100,00 TL'dir. Gun icerisinde odeme yapmaniz gerekmektedir." },
  { date: "05/02/2026 14:08", message: "Kasa bakiyeniz 28.050,00 TL'dir. Gun icerisinde odeme yapmaniz gerekmektedir." },
  { date: "04/02/2026 13:00", message: "Kasa bakiyeniz 26.100,00 TL'dir. Gun icerisinde odeme yapmaniz gerekmektedir." },
  { date: "03/02/2026 13:19", message: "Kasa bakiyeniz 9.430,00 TL'dir. Gun icerisinde odeme yapmaniz gerekmektedir." },
]

const salesData = generateSalesData()
const notifications = generateNotifications()

export function AnaSayfa({ cargos, kasaTutari }: AnaSayfaProps) {
  const [page, setPage] = useState(1)
  const notifPerPage = 6

  const yuklenecekCount = cargos.filter((c) => c.status === "yuklenecek").length
  const yoldaCount = cargos.filter((c) => c.status === "yolda").length
  const gidenCount = cargos.filter((c) => c.status === "giden").length
  const devirCount = cargos.filter((c) => c.status === "devir").length

  const visibleNotifs = useMemo(() => {
    return notifications.slice(0, page * notifPerPage)
  }, [page])

  return (
    <div className="p-4">
      {/* Status Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Yuklenecek", count: yuklenecekCount, border: "border-cargo-green" },
          { label: "Yolda", count: yoldaCount, border: "border-cargo-green" },
          { label: "Giden", count: gidenCount, border: "border-cargo-dark" },
          { label: "Devir", count: devirCount, border: "border-cargo-orange" },
        ].map((item) => (
          <div key={item.label} className={`flex items-center justify-between rounded-lg border-2 bg-card px-4 py-3 ${item.border}`}>
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cargo-green text-xs font-bold text-white">
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

      {/* Chart + Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Satis Grafigi</h3>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesData}>
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
                    formatter={(value: number, name: string) => [
                      name === "tutar" ? `${value.toLocaleString("tr-TR")} TL` : value,
                      name === "tutar" ? "Tutar" : "Adet",
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="tutar"
                    name="Tutar"
                    stroke="hsl(200, 70%, 50%)"
                    fill="hsl(200, 70%, 50%)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={{ r: 2, fill: "hsl(200, 70%, 50%)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="tarih" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Line
                      type="monotone"
                      dataKey="adet"
                      name="Adet"
                      stroke="hsl(200, 70%, 60%)"
                      strokeWidth={1.5}
                      dot={{ r: 2, fill: "hsl(200, 70%, 60%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Bildirimlerim</h3>
          </div>
          <div className="divide-y divide-border">
            <div className="grid grid-cols-[100px_1fr] gap-2 bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground">
              <span>Kayit Tarih</span>
              <span>Mesaj</span>
            </div>
            {visibleNotifs.map((n, i) => (
              <div key={i} className="grid grid-cols-[100px_1fr] gap-2 px-3 py-2.5 text-xs">
                <span className="whitespace-nowrap text-muted-foreground">{n.date}</span>
                <span className="text-foreground">{n.message}</span>
              </div>
            ))}
          </div>
          {visibleNotifs.length < notifications.length && (
            <div className="border-t border-border px-4 py-2 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="text-xs text-cargo-green transition-colors hover:text-cargo-dark hover:underline"
              >
                Daha fazla goster...
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
