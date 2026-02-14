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

interface KasaIslemi {
  id: string
  kargoTakipNo: string
  odemeyiAlanSube: string
  odemeyiYapanKisi: string
  islemTuru: string
  devredenTutar: number
  genelToplam: number
  aciklama: string
  islemTarihi: string
  personel: string
}

const mockKasaIslemleri: KasaIslemi[] = [
  { id: "1", kargoTakipNo: "203515779", odemeyiAlanSube: "Gebze", odemeyiYapanKisi: "Veysel Pazarci", islemTuru: "Nakit", devredenTutar: 0, genelToplam: 4000, aciklama: "", islemTarihi: "14/02/2026 18:06", personel: "Burak YILMAZ" },
  { id: "2", kargoTakipNo: "203515711", odemeyiAlanSube: "Gebze", odemeyiYapanKisi: "Fatih Yagan", islemTuru: "Nakit", devredenTutar: 0, genelToplam: 800, aciklama: "", islemTarihi: "14/02/2026 17:45", personel: "Burak YILMAZ" },
  { id: "3", kargoTakipNo: "203515650", odemeyiAlanSube: "Gebze", odemeyiYapanKisi: "Mehmet Ozkan", islemTuru: "Kart", devredenTutar: 0, genelToplam: 1500, aciklama: "", islemTarihi: "14/02/2026 16:30", personel: "Burak YILMAZ" },
  { id: "4", kargoTakipNo: "203515489", odemeyiAlanSube: "Gebze", odemeyiYapanKisi: "Ali Yildiz", islemTuru: "Nakit", devredenTutar: 0, genelToplam: 300, aciklama: "", islemTarihi: "14/02/2026 15:12", personel: "Burak YILMAZ" },
  { id: "5", kargoTakipNo: "203515320", odemeyiAlanSube: "Gebze", odemeyiYapanKisi: "Hasan Kaya", islemTuru: "Nakit", devredenTutar: 0, genelToplam: 2500, aciklama: "", islemTarihi: "14/02/2026 14:20", personel: "Burak YILMAZ" },
  { id: "6", kargoTakipNo: "203515210", odemeyiAlanSube: "Gebze", odemeyiYapanKisi: "Emre Demir", islemTuru: "Kart", devredenTutar: 0, genelToplam: 1000, aciklama: "", islemTarihi: "14/02/2026 12:45", personel: "Burak YILMAZ" },
]

export function KasaIslemleri() {
  const [startDate, setStartDate] = useState("2026-02-14")
  const [endDate, setEndDate] = useState("2026-02-14")
  const [searchText, setSearchText] = useState("")
  const [kasaKapatildi, setKasaKapatildi] = useState(false)

  // Auto kasa kapatma at 03:00
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

  const filtered = useMemo(() => {
    if (!searchText) return mockKasaIslemleri
    const lower = searchText.toLowerCase()
    return mockKasaIslemleri.filter(
      (k) =>
        k.kargoTakipNo.includes(lower) ||
        k.odemeyiYapanKisi.toLowerCase().includes(lower) ||
        k.personel.toLowerCase().includes(lower)
    )
  }, [searchText])

  const anlikKasa = useMemo(() => {
    return kasaKapatildi ? 0 : filtered.reduce((sum, k) => sum + k.genelToplam, 0)
  }, [filtered, kasaKapatildi])

  return (
    <div className="p-4">
      <h1 className="mb-6 text-xl font-bold text-foreground">Kasa Islemleri</h1>

      {/* Kasa Bilgisi */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Kasa Bilgisi</span>
        </div>
        <div className="p-5">
          {kasaKapatildi ? (
            <p className="mb-2 text-base font-semibold text-destructive">Bugun kasa kapatma islemi yapilmistir.</p>
          ) : (
            <p className="mb-2 text-base font-semibold text-cargo-green">Kasa acik.</p>
          )}
          <p className="text-sm text-foreground">
            <span className="font-semibold">Sube : </span>Gebze{" "}
            <span className="font-semibold">Anlik Kasa Tutar : </span>
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
              <label className="mb-1 block text-xs text-muted-foreground">Tarih</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-border bg-background" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Tarih</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-border bg-background" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="flex items-center gap-2 rounded-lg bg-cargo-green px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cargo-dark">
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
              placeholder="Arama: Tum Metin Sutunlari"
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
                <TableHead className="font-semibold text-foreground">Odemeyi Alan Sube</TableHead>
                <TableHead className="font-semibold text-foreground">Odemeyi Yapan Kisi</TableHead>
                <TableHead className="font-semibold text-foreground">Islem Turu</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Devreden Tutar</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Genel Toplam</TableHead>
                <TableHead className="font-semibold text-foreground">Aciklama</TableHead>
                <TableHead className="font-semibold text-foreground">Islem Tarihi</TableHead>
                <TableHead className="font-semibold text-foreground">Personel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Kayit bulunamadi.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((k, i) => (
                  <TableRow key={k.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <TableCell className="text-sm text-foreground">{k.kargoTakipNo}</TableCell>
                    <TableCell className="text-sm text-foreground">{k.odemeyiAlanSube}</TableCell>
                    <TableCell className="text-sm text-foreground">{k.odemeyiYapanKisi}</TableCell>
                    <TableCell className="text-sm text-foreground">{k.islemTuru}</TableCell>
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
