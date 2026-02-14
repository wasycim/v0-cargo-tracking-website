"use client"

import { useState, useEffect, useCallback } from "react"
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

const subeTabs = [
  { id: "gonderici", label: "Gonderici Sube" },
  { id: "alici", label: "Alici Sube" },
  { id: "guzergah", label: "Guzergah" },
  { id: "gunluk", label: "Gunluk Toplam" },
]

interface CiroRow {
  sube: string
  irsaliyeAdet: number
  kargoAdet: number
  toplamTutar: number
}

const mockCiroData: CiroRow[] = [
  { sube: "Gebze", irsaliyeAdet: 13, kargoAdet: 26, toplamTutar: 11500 },
]

export function SubeCiroRaporu() {
  const [startDate, setStartDate] = useState("2026-02-14")
  const [endDate, setEndDate] = useState("2026-02-14")
  const [activeTab, setActiveTab] = useState("gonderici")
  const [countdown, setCountdown] = useState(120)

  const handleRefresh = useCallback(() => {
    setCountdown(120)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-refresh at 0
          return 120
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const genelToplam = mockCiroData.reduce((sum, r) => sum + r.toplamTutar, 0)
  const genelIrsaliye = mockCiroData.reduce((sum, r) => sum + r.irsaliyeAdet, 0)
  const genelKargo = mockCiroData.reduce((sum, r) => sum + r.kargoAdet, 0)

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
              <label className="mb-1 block text-xs text-muted-foreground">Tarih</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-border bg-background" />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Tarih</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-border bg-background" />
            </div>
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
                <TableHead className="font-semibold text-foreground">Sube</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Irsaliye Adet</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Kargo Adet</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Toplam Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCiroData.map((r, i) => (
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
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
