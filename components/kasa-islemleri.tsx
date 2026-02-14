"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, RefreshCw } from "lucide-react"
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

interface KasaIslemleriProps {
  cargos: Cargo[]
  kullaniciSube?: string
}

function parseDDMMYYYY(dateStr: string): Date | null {
  const parts = dateStr.split(".")
  if (parts.length !== 3) return null
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
}

export function KasaIslemleri({ cargos, kullaniciSube }: KasaIslemleriProps) {
  const today = new Date().toISOString().split("T")[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [searchText, setSearchText] = useState("")
  const [kasaKapatildi, setKasaKapatildi] = useState(false)
  const [queryDates, setQueryDates] = useState({ start: today, end: today })

  useEffect(() => {
    const check = () => {
      const now = new Date()
      if (now.getHours() === 3 && now.getMinutes() === 0) {
        setKasaKapatildi(true)
      }
    }
    const interval = setInterval(check, 60000)
    check()
    return () => clearInterval(interval)
  }, [])

  const handleSorgula = () => {
    setQueryDates({ start: startDate, end: endDate })
  }

  const sube = kullaniciSube || "Gebze"

  const kasaIslemleri = useMemo(() => {
    const start = new Date(queryDates.start)
    start.setHours(0, 0, 0, 0)
    const end = new Date(queryDates.end)
    end.setHours(23, 59, 59, 999)

    return cargos
      .filter((c) => {
        if (!c.departureDate) return false
        const d = parseDDMMYYYY(c.departureDate)
        if (!d) return false
        return d >= start && d <= end
      })
      .map((c) => ({
        kargoTakipNo: c.trackingNo,
        odemeyiAlanSube: sube,
        odemeyiYapanKisi: c.sender.split("\n")[0],
        islemTuru: c.status === "iptal" ? "İptal" : "Nakit",
        devredenTutar: 0,
        genelToplam: c.status === "iptal" ? 0 : c.amount,
        aciklama: c.status === "iptal" ? "İptal edildi" : "",
        islemTarihi: `${c.departureDate} ${c.departureTime}`,
        personel: "Personel",
        isGiris: c.status !== "iptal",
      }))
  }, [cargos, queryDates, sube])

  const filteredIslemler = useMemo(() => {
    if (!searchText) return kasaIslemleri
    const lower = searchText.toLowerCase()
    return kasaIslemleri.filter(
      (k) =>
        k.kargoTakipNo.toLowerCase().includes(lower) ||
        k.odemeyiYapanKisi.toLowerCase().includes(lower)
    )
  }, [kasaIslemleri, searchText])

  const anlikKasa = useMemo(() => {
    if (kasaKapatildi) return 0
    return filteredIslemler.reduce((sum, k) => sum + (k.isGiris ? k.genelToplam : 0), 0)
  }, [filteredIslemler, kasaKapatildi])

  return (
    <div className="p-4">
      <h1 className="mb-6 text-xl font-bold text-foreground">Kasa İşlemleri</h1>

      {/* Kasa Bilgisi */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Kasa Bilgisi</span>
        </div>
        <div className="p-5">
          {kasaKapatildi ? (
            <p className="mb-2 text-base font-semibold text-destructive">Bugün kasa kapatma işlemi yapılmıştır.</p>
          ) : (
            <p className="mb-2 text-base font-semibold text-cargo-green">Kasa açık.</p>
          )}
          <p className="text-sm text-foreground">
            <span className="font-semibold">Şube : </span>{sube}{" "}
            <span className="font-semibold">Anlık Kasa Tutarı : </span>
            {anlikKasa.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Kriterler */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Kriterler</span>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Başlangıç Tarihi</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-border bg-background" />
            </div>
            <div className="flex-1">
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

      {/* Search & Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Arama: Tüm Metin Sütunları"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-8 w-48 border-border bg-background text-xs"
            />
            <button className="rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">Git</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground">Kargo Takip No</TableHead>
                <TableHead className="font-semibold text-foreground">Ödemeyi Alan Şube</TableHead>
                <TableHead className="font-semibold text-foreground">Ödemeyi Yapan Kişi</TableHead>
                <TableHead className="font-semibold text-foreground">İşlem Türü</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Devreden Tutar</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Genel Toplam</TableHead>
                <TableHead className="font-semibold text-foreground">Açıklama</TableHead>
                <TableHead className="font-semibold text-foreground">İşlem Tarihi</TableHead>
                <TableHead className="font-semibold text-foreground">Personel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIslemler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Seçilen tarih aralığında işlem bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIslemler.map((k, i) => (
                  <TableRow key={`${k.kargoTakipNo}-${i}`} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <TableCell className="text-sm text-foreground">{k.kargoTakipNo}</TableCell>
                    <TableCell className="text-sm text-foreground">{k.odemeyiAlanSube}</TableCell>
                    <TableCell className="text-sm text-foreground">{k.odemeyiYapanKisi}</TableCell>
                    <TableCell>
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        k.isGiris
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {k.islemTuru}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground">{k.devredenTutar.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right text-sm font-medium text-foreground">{k.genelToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{k.aciklama || "-"}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">{k.islemTarihi}</TableCell>
                    <TableCell className="text-sm text-foreground">{k.personel}</TableCell>
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
