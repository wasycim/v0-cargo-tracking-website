"use client"

import { Menu, RefreshCw, Pencil, Copy, Check, Barcode } from "lucide-react"
import type { Cargo } from "@/lib/cargo-data"
import { statusColors, statusLabels } from "@/lib/cargo-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useEffect, useCallback } from "react"

interface SubeAyarlar {
  peron_no?: string
  sirket_telefon?: string
}

interface CargoTableProps {
  cargos: Cargo[]
  onLoadCargo?: (cargoId: string, trackingNo: string) => void
  onEditCargo?: (cargo: Cargo) => void
  onToast?: (message: string) => void
  kullaniciSube?: string
  subeAyarlar?: SubeAyarlar | null
}

function StatusBadge({ status }: { status: Cargo["status"] }) {
  const colors = statusColors[status]
  const label = statusLabels[status]
  return (
    <span className={`inline-block rounded px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
      {label}
    </span>
  )
}

function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length >= 10) {
    return `(***) *** ${cleaned.slice(-4).slice(0, 2)} ${cleaned.slice(-2)}`
  }
  return phone
}

export function CargoTable({ cargos, onLoadCargo, onEditCargo, onToast, kullaniciSube }: CargoTableProps) {
  const [countdown, setCountdown] = useState(120)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 120 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCopyTracking = useCallback(async (trackingNo: string, cargoId: string) => {
    try {
      await navigator.clipboard.writeText(trackingNo.replace(/\s/g, ""))
      setCopiedId(cargoId)
      onToast?.(`Takip No kopyalandı: ${trackingNo}`)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      const el = document.createElement("textarea")
      el.value = trackingNo.replace(/\s/g, "")
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopiedId(cargoId)
      onToast?.(`Takip No kopyalandı: ${trackingNo}`)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }, [onToast])

  const handlePrintBarcode = useCallback((cargo: Cargo) => {
    onToast?.("Barkod yazdırılıyor")

    // Extract destination city name (big title)
    const destCity = cargo.toCity || cargo.to.split("/").pop()?.trim() || "---"
    const fromCity = kullaniciSube || cargo.fromCity || "Gebze"
    const hatName = `${destCity.toUpperCase()} HATTI`
    const today = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
    // gonderim tipi: AH PÖ etc
    const gonderimKodu = "AH PÖ"

    const senderPhone = cargo.senderTelefon ? maskPhone(cargo.senderTelefon) : "(***) *** ** **"
    const receiverPhone = cargo.receiverTelefon ? maskPhone(cargo.receiverTelefon) : "(***) *** ** **"

    const printWindow = window.open("", "_blank", "width=500,height=600")
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html>
<html>
<head><title>Barkod - ${cargo.trackingNo}</title>
<style>
  @page { margin: 2mm; size: 100mm 70mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; width: 100mm; padding: 3mm; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1mm; }
  .dest-city { font-size: 22pt; font-weight: bold; letter-spacing: 1px; }
  .gonderim-kodu { font-size: 10pt; font-weight: bold; text-align: right; }
  .from-city { font-size: 11pt; margin-bottom: 0.5mm; }
  .tracking-no { font-size: 14pt; font-weight: bold; text-align: right; }
  .hat-name { font-size: 11pt; font-weight: bold; margin-bottom: 2mm; }
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; font-size: 8pt; }
  .info-table td, .info-table th { border: 0.5px solid #000; padding: 1.5mm 2mm; vertical-align: top; }
  .info-table .section-header { text-align: center; font-weight: bold; font-size: 8pt; background: #f0f0f0; padding: 1mm; }
  .info-table .label { font-weight: bold; width: 35mm; white-space: nowrap; }
  .footer { font-size: 7pt; text-align: center; margin-top: 2mm; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="dest-city">${destCity.toUpperCase()}</div>
      <div class="from-city">${fromCity.toUpperCase()}</div>
    </div>
    <div style="text-align:right">
      <div class="gonderim-kodu">${gonderimKodu}</div>
      <div class="tracking-no">${cargo.trackingNo}</div>
    </div>
  </div>

  <div class="hat-name">${hatName}</div>

  <table class="info-table">
    <tr>
      <td colspan="2" class="section-header">GÖNDERİCİ BİLGİLERİ</td>
      <td class="label">Tarih</td>
      <td>${today}</td>
    </tr>
    <tr>
      <td colspan="2" rowspan="3" style="vertical-align:top; line-height: 1.5;">
        ${cargo.sender.replace(/\n/g, "<br>")}<br>
        ${senderPhone}<br>
        ${cargo.from}
      </td>
      <td class="label">Türü</td>
      <td>Paket</td>
    </tr>
    <tr>
      <td class="label">KG/DS</td>
      <td>-</td>
    </tr>
    <tr>
      <td class="label">Adet</td>
      <td>${cargo.pieces}/1</td>
    </tr>
    <tr>
      <td colspan="4" class="section-header">ALICI BİLGİLERİ</td>
    </tr>
    <tr>
      <td colspan="4" style="line-height: 1.5;">
        ${cargo.receiver.replace(/\n/g, "<br>")}<br>
        ${receiverPhone}<br>
        ${cargo.to}
      </td>
    </tr>
  </table>

  <div class="footer">Kayıp Halinde İletişim İçin Lütfen Arayınız: 0850 333 35 35</div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`)
      printWindow.document.close()
    }
  }, [onToast, kullaniciSube])

  return (
    <div className="px-4 pb-4">
      <div className="mb-2 flex items-center justify-end gap-4 py-2 text-sm text-muted-foreground">
        <span>Liste {countdown} sn. sonra yenilenecek.</span>
        <button onClick={() => setCountdown(120)} className="flex items-center gap-1 transition-colors hover:text-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          Yenile
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px] text-center font-semibold text-foreground">Kargo Durum</TableHead>
              <TableHead className="w-[80px]"></TableHead>
              <TableHead className="font-semibold text-foreground">Takip No</TableHead>
              <TableHead className="w-[60px] text-center font-semibold text-foreground">Parça</TableHead>
              <TableHead className="font-semibold text-foreground">Gönderici</TableHead>
              <TableHead className="font-semibold text-foreground">Alıcı</TableHead>
              <TableHead className="font-semibold text-foreground">Nereden</TableHead>
              <TableHead className="font-semibold text-foreground">Nereye</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Tutar</TableHead>
              <TableHead className="text-center font-semibold text-foreground">
                <div>Sefer Hareket</div><div>Tarihi</div>
              </TableHead>
              <TableHead className="text-center font-semibold text-foreground">
                <div>Sefer Varış</div><div>Tarihi</div>
              </TableHead>
              <TableHead className="font-semibold text-foreground">Plaka</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="py-12 text-center text-muted-foreground">
                  Gösterilecek kargo bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              cargos.map((cargo, index) => (
                <TableRow key={cargo.id} className={`${index % 2 === 0 ? "bg-card" : "bg-muted/30"} transition-colors hover:bg-muted/50`}>
                  <TableCell className="text-center">
                    <StatusBadge status={cargo.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {cargo.status === "yuklenecek" ? (
                        <button
                          onClick={() => onLoadCargo?.(cargo.id, cargo.trackingNo)}
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-cargo-green/10 hover:text-cargo-green"
                          aria-label="Kargo yükle"
                          title="Kargo Yükle"
                        >
                          <Menu className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="p-1 text-muted-foreground/30"><Menu className="h-4 w-4" /></span>
                      )}
                      <button
                        onClick={() => onEditCargo?.(cargo)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                        aria-label="Kargo bilgileri düzenle"
                        title="Kargo Bilgileri Düzenle"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handlePrintBarcode(cargo)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                        aria-label="Barkod yazdır"
                        title="Barkod Yazdır"
                      >
                        <Barcode className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleCopyTracking(cargo.trackingNo, cargo.id)}
                      className="group flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Tıklayarak kopyala"
                    >
                      <span className="underline">{cargo.trackingNo}</span>
                      {copiedId === cargo.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-center text-sm text-foreground">{cargo.pieces}</TableCell>
                  <TableCell className="max-w-[250px] text-sm text-foreground">
                    {cargo.sender.split("\n").map((line, i) => (<div key={i}>{line}</div>))}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {cargo.receiver.split("\n").map((line, i) => (<div key={i}>{line}</div>))}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    <div className="text-muted-foreground">{cargo.from}</div>
                    <div className="font-semibold">{cargo.fromCity}</div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    <div className="text-muted-foreground">{cargo.to}</div>
                    <div className="font-semibold">{cargo.toCity}</div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium text-foreground">
                    {cargo.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={`rounded px-2 py-1 text-xs ${
                      cargo.status === "yuklenecek"
                        ? "bg-amber-100 font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-300"
                        : "text-foreground"
                    }`}>
                      <div>{cargo.departureDate}</div><div>{cargo.departureTime}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs text-foreground">
                    <div>{cargo.arrivalDate}</div><div>{cargo.arrivalTime}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-foreground">{cargo.plate}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
