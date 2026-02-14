"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Cargo } from "@/lib/cargo-data"

interface SubeCiroRaporuProps {
  cargos: Cargo[]
}

const subeTabs = [
  { id: "gonderici", label: "Gönderici Şube" },
  { id: "alici", label: "Alıcı Şube" },
  { id: "gunluk", label: "Günlük Toplam" },
]

function parseDDMMYYYY(dateStr: string): Date | null {
  const parts = dateStr.split(".")
  if (parts.length !== 3) return null
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
}

export function SubeCiroRaporu({ cargos }: SubeCiroRaporuProps) {
  const today = new Date().toISOString().split("T")[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [activeTab, setActiveTab] = useState("gonderici")
  const [countdown, setCountdown] = useState(120)
  const [queryDates, setQueryDates] = useState({ start: today, end: today })

  const handleRefresh = useCallback(() => {
    setCountdown(120)
    setQueryDates({ start: startDate, end: endDate })
  }, [startDate, endDate])

  const handleSorgula = () => {
    setQueryDates({ start: startDate, end: endDate })
    setCountdown(120)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 120
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const ciroData = useMemo(() => {
    const start = new Date(queryDates.start)
    start.setHours(0, 0, 0, 0)
    const end = new Date(queryDates.end)
    end.setHours(23, 59, 59, 999)

    const filteredCargos = cargos.filter((c) => {
      if (c.status === "iptal") return false
      if (!c.departureDate) return false
      const d = parseDDMMYYYY(c.departureDate)
      if (!d) return false
      return d >= start && d <= end
    })

    if (activeTab === "gunluk") {
      const dateMap: Record<string, { adet: number; tutar: number }> = {}
      filteredCargos.forEach((c) => {
        const key = c.departureDate
        if (!dateMap[key]) dateMap[key] = { adet: 0, tutar: 0 }
        dateMap[key].adet += 1
        dateMap[key].tutar += c.amount
      })
      return Object.entries(dateMap).map(([tarih, data]) => ({
        sube: tarih,
        kargoAdet: data.adet,
        irsaliyeAdet: Math.ceil(data.adet / 2),
        toplamTutar: data.tutar,
      }))
    }

    const subeMap: Record<string, { kargoAdet: number; irsaliyeAdet: number; toplamTutar: number }> = {}
    filteredCargos.forEach((c) => {
      const sube = activeTab === "gonderici" ? c.fromCity : c.toCity
      if (!subeMap[sube]) subeMap[sube] = { kargoAdet: 0, irsaliyeAdet: 0, toplamTutar: 0 }
      subeMap[sube].kargoAdet += 1
      subeMap[sube].irsaliyeAdet += c.pieces
      subeMap[sube].toplamTutar += c.amount
    })

    return Object.entries(subeMap).map(([sube, data]) => ({
      sube,
      ...data,
    }))
  }, [cargos, queryDates, activeTab])

  const genelToplam = ciroData.reduce((sum, r) => sum + r.toplamTutar, 0)
  const genelIrsaliye = ciroData.reduce((sum, r) => sum + r.irsaliyeAdet, 0)
  const genelKargo = ciroData.reduce((sum, r) => sum + r.kargoAdet, 0)

  return (
    <div>
      {/* Kriterler */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Kriterler</span>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Başlangıç Tarihi</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-border bg-background" />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Bitiş Tarihi</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-border bg-background" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSorgula}
              className="flex items-center gap-2 rounded-lg bg-cargo-green px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cargo-dark"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sorgula
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="mb-4 flex gap-1 border-b border-border">
        {subeTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-cargo-green text-cargo-green"
                : "text-foreground hover:text-cargo-green"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Countdown + Refresh */}
      <div className="mb-3 flex items-center justify-end gap-4 text-sm text-muted-foreground">
        <span>Liste {countdown} sn. sonra yenilenecek.</span>
        <button onClick={handleRefresh} className="flex items-center gap-1 transition-colors hover:text-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          Yenile
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground">{activeTab === "gunluk" ? "Tarih" : "Şube"}</TableHead>
                <TableHead className="text-right font-semibold text-foreground">İrsaliye Adet</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Kargo Adet</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Toplam Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ciroData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Seçilen tarih aralığında kayıt bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {ciroData.map((r, i) => (
                    <TableRow key={r.sube} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                      <TableCell className="text-sm text-foreground">{r.sube}</TableCell>
                      <TableCell className="text-right text-sm text-foreground">{r.irsaliyeAdet}</TableCell>
                      <TableCell className="text-right text-sm text-foreground">{r.kargoAdet}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-foreground">{r.toplamTutar.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell className="text-sm text-foreground">Genel Toplam</TableCell>
                    <TableCell className="text-right text-sm text-foreground">{genelIrsaliye}</TableCell>
                    <TableCell className="text-right text-sm text-foreground">{genelKargo}</TableCell>
                    <TableCell className="text-right text-sm text-foreground">{genelToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
