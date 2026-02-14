"use client"

import { useState, useMemo } from "react"
import { RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface IadeKargo {
  takipNo: string
  kayitTarihi: string
  gonderici: string
  alici: string
  iadeSebebi: string
  durum: string
}

const mockIadeKargolar: IadeKargo[] = [
  { takipNo: "203514200", kayitTarihi: "13/02/2026 14:20", gonderici: "Ali Veli", alici: "Ahmet Yilmaz", iadeSebebi: "Hasarli urun", durum: "Iade Edildi" },
  { takipNo: "203513890", kayitTarihi: "12/02/2026 10:15", gonderici: "Mehmet Kara", alici: "Fatma Celik", iadeSebebi: "Yanlis urun", durum: "Iade Surecinde" },
  { takipNo: "203513450", kayitTarihi: "11/02/2026 16:45", gonderici: "Ayse Demir", alici: "Hakan Oz", iadeSebebi: "Alici red", durum: "Iade Edildi" },
]

export function IadeKargolar() {
  const [startDate, setStartDate] = useState("2026-01-15")
  const [endDate, setEndDate] = useState("2026-02-14")
  const [searchText, setSearchText] = useState("")

  const filtered = useMemo(() => {
    if (!searchText) return mockIadeKargolar
    const lower = searchText.toLowerCase()
    return mockIadeKargolar.filter(
      (r) =>
        r.takipNo.includes(lower) ||
        r.gonderici.toLowerCase().includes(lower) ||
        r.alici.toLowerCase().includes(lower)
    )
  }, [searchText])

  return (
    <div>
      {/* Kriterler */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Kriterler</span>
        </div>
        <div className="p-5">
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Tarih</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-border bg-background" />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Tarih</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-border bg-background" />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="flex items-center gap-2 rounded-lg bg-cargo-green px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cargo-dark">
              <RefreshCw className="h-3.5 w-3.5" />
              Sorgula
            </button>
          </div>
        </div>
      </div>

      {/* Search + Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Arama: Tum Metin Sutunlari"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-8 w-48 border-border bg-background text-xs"
          />
          <button className="rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">Git</button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground">Takip No</TableHead>
                <TableHead className="font-semibold text-foreground">Kayit Tarihi</TableHead>
                <TableHead className="font-semibold text-foreground">Gonderici</TableHead>
                <TableHead className="font-semibold text-foreground">Alici</TableHead>
                <TableHead className="font-semibold text-foreground">Iade Sebebi</TableHead>
                <TableHead className="font-semibold text-foreground">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Kayit bulunamadi.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r, i) => (
                  <TableRow key={r.takipNo} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <TableCell className="text-sm text-blue-600 dark:text-blue-400">{r.takipNo}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.kayitTarihi}</TableCell>
                    <TableCell className="text-sm text-foreground">{r.gonderici}</TableCell>
                    <TableCell className="text-sm text-foreground">{r.alici}</TableCell>
                    <TableCell className="text-sm text-foreground">{r.iadeSebebi}</TableCell>
                    <TableCell>
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        r.durum === "Iade Edildi"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {r.durum}
                      </span>
                    </TableCell>
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
