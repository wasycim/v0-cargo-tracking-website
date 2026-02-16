"use client"

import { useState, useMemo } from "react"
import { RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Cargo } from "@/lib/cargo-data"
import { statusLabels } from "@/lib/cargo-data"

interface KargoRaporuProps {
  cargos: Cargo[]
}

function parseDDMMYYYY(dateStr: string): Date | null {
  const parts = dateStr.split(".")
  if (parts.length !== 3) return null
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
}

export function KargoRaporu({ cargos }: KargoRaporuProps) {
  const today = new Date().toISOString().split("T")[0]

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [searchText, setSearchText] = useState("")
  const [showIptal, setShowIptal] = useState(false)
  const [queryDates, setQueryDates] = useState({ start: today, end: today })

  const handleSorgula = () => {
    setQueryDates({ start: startDate, end: endDate })
  }

  const filtered = useMemo(() => {
    const start = new Date(queryDates.start)
    start.setHours(0, 0, 0, 0)
    const end = new Date(queryDates.end)
    end.setHours(23, 59, 59, 999)

    let result = cargos.filter((c) => {
      if (!c.departureDate) {
        // departureDate yoksa createdAt'a bak
        if (!c.createdAt) return false
        const d = new Date(c.createdAt)
        return d >= start && d <= end
      }
      const d = parseDDMMYYYY(c.departureDate)
      if (!d) return false
      return d >= start && d <= end
    })

    if (showIptal) {
      result = result.filter((c) => c.status === "iptal")
    }

    if (searchText) {
      const lower = searchText.toLowerCase()
      result = result.filter(
        (r) =>
          r.trackingNo.toLowerCase().includes(lower) ||
          r.sender.toLowerCase().includes(lower) ||
          r.receiver.toLowerCase().includes(lower)
      )
    }

    return result
  }, [cargos, queryDates, searchText, showIptal])

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Kriterler</span>
        </div>
        <div className="p-5">
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">{"Ba\u015flang\u0131\u00e7 Tarihi"}</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-border bg-background" />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">{"Biti\u015f Tarihi"}</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-border bg-background" />
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={showIptal} onCheckedChange={(v) => setShowIptal(v as boolean)} />
              {"Sadece iptalleri g\u00f6ster"}
            </label>
          </div>

          <div className="flex justify-end">
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

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={"Arama: T\u00fcm Metin S\u00fctunlar\u0131"}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-8 w-48 border-border bg-background text-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Takip No</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Tarih</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">{"G\u00f6nderici"}</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">{"Al\u0131c\u0131"}</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Nereden</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Nereye</TableHead>
                <TableHead className="whitespace-nowrap text-right font-semibold text-foreground">Tutar</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Durum</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Plaka</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    {"Kay\u0131t bulunamad\u0131."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r, i) => (
                  <TableRow key={`${r.trackingNo}-${i}`} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <TableCell className="text-sm text-blue-600 dark:text-blue-400">{r.trackingNo}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.departureDate} {r.departureTime}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-foreground">{r.sender.split("\n")[0]}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-foreground">{r.receiver.split("\n")[0]}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.from}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.to}</TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm font-medium text-foreground">{r.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        r.status === "iptal"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : r.status === "giden" || r.status === "gonderildi"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {statusLabels[r.status]}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.plate || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
