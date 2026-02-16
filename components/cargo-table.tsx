"use client"

import { Menu, RefreshCw, Pencil, Copy, Check, Barcode, Eye, X } from "lucide-react"
import type { Cargo } from "@/lib/cargo-data"
import { getStatusColor, statusLabels } from "@/lib/cargo-data"
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
  const colors = getStatusColor(status)
  const label = statusLabels[status] || status || "Bilinmiyor"
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

// Kargo Detay Modali (sadece goruntuleme - duzenleme yok)
function CargoDetailModal({ cargo, onClose }: { cargo: Cargo; onClose: () => void }) {
  const rows = [
    { label: "Takip No", value: cargo.trackingNo },
    { label: "Durum", value: statusLabels[cargo.status] },
    { label: "Par\u00e7a Adedi", value: String(cargo.pieces) },
    { label: "G\u00f6nderici", value: cargo.sender },
    { label: "G\u00f6nderici Tel", value: cargo.senderTelefon || "-" },
    { label: "Al\u0131c\u0131", value: cargo.receiver },
    { label: "Al\u0131c\u0131 Tel", value: cargo.receiverTelefon || "-" },
    { label: "Nereden", value: `${cargo.from} / ${cargo.fromCity}` },
    { label: "Nereye", value: `${cargo.to} / ${cargo.toCity}` },
    { label: "Tutar", value: cargo.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " TL" },
    { label: "Hareket Tarihi", value: cargo.departureDate ? `${cargo.departureDate} ${cargo.departureTime}` : "-" },
    { label: "Var\u0131\u015f Tarihi", value: cargo.arrivalDate ? `${cargo.arrivalDate} ${cargo.arrivalTime}` : "-" },
    { label: "Plaka", value: cargo.plate || "-" },
    { label: "Firma", value: cargo.firma || "-" },
    { label: "Ara\u00e7 Telefon", value: cargo.aracTelefon || "-" },
    { label: "Olu\u015fturulma", value: cargo.createdAt ? new Date(cargo.createdAt).toLocaleString("tr-TR") : "-" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Kargo Detay\u0131</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.label} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
                <span className="min-w-[120px] shrink-0 text-xs font-semibold text-muted-foreground">{r.label}</span>
                <span className="whitespace-pre-wrap text-sm text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CargoTable({ cargos, onLoadCargo, onEditCargo, onToast, kullaniciSube, subeAyarlar }: CargoTableProps) {
  const [countdown, setCountdown] = useState(120)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [detailCargo, setDetailCargo] = useState<Cargo | null>(null)

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
      onToast?.("Takip No kopyaland\u0131: " + trackingNo)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      const el = document.createElement("textarea")
      el.value = trackingNo.replace(/\s/g, "")
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopiedId(cargoId)
      onToast?.("Takip No kopyaland\u0131: " + trackingNo)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }, [onToast])

  const handlePrintBarcode = useCallback((cargo: Cargo) => {
    const totalPieces = cargo.pieces || 1
    onToast?.(totalPieces + " adet barkod yazd\u0131r\u0131l\u0131yor...")

    const destCity = cargo.toCity || cargo.to.split("/").pop()?.trim() || "---"
    const fromCity = kullaniciSube || cargo.fromCity || "Gebze"
    const hatName = destCity.toUpperCase() + " HATTI"
    const today = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
    const gonderimKodu = "AH P\u00d6"
    const senderPhone = cargo.senderTelefon ? maskPhone(cargo.senderTelefon) : "(***) *** ** **"
    const receiverPhone = cargo.receiverTelefon ? maskPhone(cargo.receiverTelefon) : "(***) *** ** **"

    const footerParts = [fromCity]
    if (subeAyarlar?.peron_no) footerParts.push("Peron " + subeAyarlar.peron_no)
    if (subeAyarlar?.sirket_telefon) footerParts.push(subeAyarlar.sirket_telefon)
    const footerText = footerParts.join(" / ")

    const pages: string[] = []
    for (let i = totalPieces; i >= 1; i--) {
      const parcaLabel = i + "/" + totalPieces
      pages.push([
        '<div class="page">',
        '<div class="header"><div>',
        '<div class="dest-city">' + destCity.toUpperCase() + '</div>',
        '<div class="from-city">' + fromCity.toUpperCase() + '</div>',
        '</div><div style="text-align:right">',
        '<div class="gonderim-kodu">' + gonderimKodu + '</div>',
        '<div class="tracking-no">' + cargo.trackingNo + '</div>',
        '<div class="parca-label">' + parcaLabel + '</div>',
        '</div></div>',
        '<div class="hat-name">' + hatName + '</div>',
        '<table class="info-table">',
        '<tr><td colspan="2" class="section-header">G\u00f6nderici Bilgileri</td><td class="label">Tarih</td><td>' + today + '</td></tr>',
        '<tr><td colspan="2" rowspan="2" class="sender-info">' + cargo.sender + '<br>' + senderPhone + '<br>' + (cargo.from || '') + '</td><td class="label">T\u00fcr\u00fc</td><td>Paket</td></tr>',
        '<tr><td class="label">Par\u00e7a</td><td style="font-weight:bold;font-size:9pt">' + parcaLabel + '</td></tr>',
        '<tr><td colspan="4" class="section-header">Al\u0131c\u0131 Bilgileri</td></tr>',
        '<tr><td colspan="4" class="sender-info">' + cargo.receiver + '<br>' + receiverPhone + '<br>' + (cargo.to || '') + '</td></tr>',
        '</table>',
        '<div class="footer">' + footerText + '</div></div>'
      ].join('\n'))
    }

    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Barkod</title><style>@page{margin:0;size:100mm 70mm}*{margin:0;padding:0;box-sizing:border-box}.page{width:100mm;height:70mm;padding:2.5mm;overflow:hidden;page-break-after:always;font-family:Arial,sans-serif}.page:last-child{page-break-after:avoid}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5mm}.dest-city{font-size:20pt;font-weight:bold;letter-spacing:.5px;line-height:1.1}.gonderim-kodu{font-size:9pt;font-weight:bold;text-align:right}.from-city{font-size:10pt;margin-bottom:.3mm}.tracking-no{font-size:13pt;font-weight:bold;text-align:right;letter-spacing:1px}.parca-label{font-size:14pt;font-weight:bold;text-align:right;margin-top:.5mm}.hat-name{font-size:10pt;font-weight:bold;margin-bottom:1mm}.info-table{width:100%;border-collapse:collapse;margin-bottom:1mm;font-size:7pt}.info-table td,.info-table th{border:.5px solid #000;padding:1mm 1.5mm;vertical-align:top}.info-table .section-header{text-align:center;font-weight:bold;font-size:7pt;background:#e8e8e8;padding:.8mm}.info-table .label{font-weight:bold;width:28mm;white-space:nowrap}.sender-info{line-height:1.4;font-size:7pt}.footer{font-size:6.5pt;text-align:center;margin-top:1mm;border-top:.5px solid #000;padding-top:.8mm}</style></head><body>' + pages.join('\n') + '</body></html>'

    const printWindow = window.open("", "_blank", "width=500,height=600")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }, [onToast, kullaniciSube, subeAyarlar])

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
              <TableHead className="w-[100px]"></TableHead>
              <TableHead className="font-semibold text-foreground">Takip No</TableHead>
              <TableHead className="w-[60px] text-center font-semibold text-foreground">{"Par\u00e7a"}</TableHead>
              <TableHead className="font-semibold text-foreground">{"G\u00f6nderici"}</TableHead>
              <TableHead className="font-semibold text-foreground">{"Al\u0131c\u0131"}</TableHead>
              <TableHead className="font-semibold text-foreground">Nereden</TableHead>
              <TableHead className="font-semibold text-foreground">Nereye</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Tutar</TableHead>
              <TableHead className="text-center font-semibold text-foreground">Tarih</TableHead>
              <TableHead className="font-semibold text-foreground">Plaka</TableHead>
              <TableHead className="font-semibold text-foreground">Firma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="py-12 text-center text-muted-foreground">
                  {"G\u00f6sterilecek kargo bulunamad\u0131."}
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
                      {/* Goz ikonu - detay goruntule */}
                      <button
                        onClick={() => setDetailCargo(cargo)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400"
                        aria-label="Kargo detay\u0131"
                        title="Kargo Detay\u0131"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {cargo.status === "yuklenecek" ? (
                        <button
                          onClick={() => onLoadCargo?.(cargo.id, cargo.trackingNo)}
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-cargo-green/10 hover:text-cargo-green"
                          aria-label="Kargo y\u00fckle"
                          title="Kargo Y\u00fckle"
                        >
                          <Menu className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="p-1 text-muted-foreground/30"><Menu className="h-4 w-4" /></span>
                      )}
                      <button
                        onClick={() => onEditCargo?.(cargo)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                        aria-label="D\u00fczenle"
                        title="D\u00fczenle"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handlePrintBarcode(cargo)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                        aria-label="Barkod"
                        title="Barkod"
                      >
                        <Barcode className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleCopyTracking(cargo.trackingNo, cargo.id)}
                      className="group flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Kopyala"
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
                    <div className="text-xs text-foreground">
                      <div>{cargo.createdAt ? new Date(cargo.createdAt).toLocaleDateString("tr-TR") : cargo.departureDate || "-"}</div>
                      <div className="text-muted-foreground">{cargo.createdAt ? new Date(cargo.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : cargo.departureTime || ""}</div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-foreground">{cargo.plate || "-"}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-foreground">{cargo.firma || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Kargo Detay Modali */}
      {detailCargo && <CargoDetailModal cargo={detailCargo} onClose={() => setDetailCargo(null)} />}
    </div>
  )
}
