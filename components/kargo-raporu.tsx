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

interface KargoRaporRow {
  takipNo: string
  kayitTarihi: string
  gonderici: string
  gondericiTelefon: string
  gondericiTckn: string
  gondericiTipi: string
  alici: string
  aliciTelefon: string
  aliciTipi: string
  gonderimTipi: string
  odemeTipi: string
  teslimAlan: string
  teslim: string
}

const mockKargoRapor: KargoRaporRow[] = [
  { takipNo: "203515950", kayitTarihi: "14/02/2026 18:48", gonderici: "Muhammet Tiftik", gondericiTelefon: "(537) 651 93 46", gondericiTckn: "31613391186", gondericiTipi: "Gercek Kisi", alici: "Mehmet Avci", aliciTelefon: "(532) 726 55 56", aliciTipi: "Gercek Kisi", gonderimTipi: "Alici Haberli - AH", odemeTipi: "Pesin Odeme - PO(+)", teslimAlan: "", teslim: "" },
  { takipNo: "203515943", kayitTarihi: "14/02/2026 18:42", gonderici: "Pamukkale Ulasim Seyahat Ve T...", gondericiTelefon: "(850) 333 35 35", gondericiTckn: "7210962642", gondericiTipi: "Tuzel Kisi", alici: "Pamukkale Ulasim Seyahat Ve Tu...", aliciTelefon: "(543) 378 92 51", aliciTipi: "Tuzel Kisi", gonderimTipi: "Alici Haberli - AH", odemeTipi: "Pesin Odeme - PO(+)", teslimAlan: "", teslim: "" },
  { takipNo: "203515935", kayitTarihi: "14/02/2026 18:41", gonderici: "Huseyin Ocaktan", gondericiTelefon: "(543) 597 38 35", gondericiTckn: "34744013804", gondericiTipi: "Gercek Kisi", alici: "Erkan Akhan", aliciTelefon: "(530) 112 44 17", aliciTipi: "Gercek Kisi", gonderimTipi: "Alici Haberli - AH", odemeTipi: "Pesin Odeme - PO(+)", teslimAlan: "", teslim: "" },
  { takipNo: "203515929", kayitTarihi: "14/02/2026 18:40", gonderici: "Cemil Ay", gondericiTelefon: "(546) 294 42 35", gondericiTckn: "47431634664", gondericiTipi: "Gercek Kisi", alici: "Atakan Yuruc", aliciTelefon: "(535) 668 81 30", aliciTipi: "Gercek Kisi", gonderimTipi: "Alici Haberli - AH", odemeTipi: "Pesin Odeme - PO(+)", teslimAlan: "", teslim: "" },
  { takipNo: "203515924", kayitTarihi: "14/02/2026 18:39", gonderici: "Cemil Ay", gondericiTelefon: "(546) 294 42 35", gondericiTckn: "47431634664", gondericiTipi: "Gercek Kisi", alici: "Ekrem Karahanli", aliciTelefon: "(530) 223 40 76", aliciTipi: "Gercek Kisi", gonderimTipi: "Alici Haberli - AH", odemeTipi: "Pesin Odeme - PO(+)", teslimAlan: "", teslim: "" },
  { takipNo: "203515914", kayitTarihi: "14/02/2026 18:39", gonderici: "Cemil Ay", gondericiTelefon: "(546) 294 42 35", gondericiTckn: "47431634664", gondericiTipi: "Gercek Kisi", alici: "Alperen Ozdemir", aliciTelefon: "(543) 855 42 44", aliciTipi: "Gercek Kisi", gonderimTipi: "Alici Haberli - AH", odemeTipi: "Pesin Odeme - PO(+)", teslimAlan: "", teslim: "" },
]

export function KargoRaporu() {
  const [startDate, setStartDate] = useState("2026-01-15")
  const [endDate, setEndDate] = useState("2026-02-14")
  const [searchText, setSearchText] = useState("")
  const [showDevir, setShowDevir] = useState(false)
  const [showIptal, setShowIptal] = useState(false)

  const filtered = useMemo(() => {
    if (!searchText) return mockKargoRapor
    const lower = searchText.toLowerCase()
    return mockKargoRapor.filter(
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

          <div className="mb-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={showDevir} onCheckedChange={(v) => setShowDevir(v as boolean)} />
              Sadece devir kargolari goster
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={showIptal} onCheckedChange={(v) => setShowIptal(v as boolean)} />
              Sadece iptalleri goster
            </label>
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
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Takip No</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Kayit Tarihi</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Gonderici</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Gonderici Telefon</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Gonderici Tckn/Vkn</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Gonderici Tipi</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Alici</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Alici Telefon</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Alici Tipi</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Gonderim Tipi</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Odeme Tipi</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Teslim Alan</TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-foreground">Teslim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="py-8 text-center text-muted-foreground">
                    Kayit bulunamadi.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r, i) => (
                  <TableRow key={r.takipNo} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <TableCell className="text-sm text-blue-600 dark:text-blue-400">{r.takipNo}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.kayitTarihi}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-foreground">{r.gonderici}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.gondericiTelefon}</TableCell>
                    <TableCell className="text-sm text-foreground">{r.gondericiTckn}</TableCell>
                    <TableCell className="text-sm text-foreground">{r.gondericiTipi}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-foreground">{r.alici}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.aliciTelefon}</TableCell>
                    <TableCell className="text-sm text-foreground">{r.aliciTipi}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.gonderimTipi}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{r.odemeTipi}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.teslimAlan || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.teslim || "-"}</TableCell>
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
