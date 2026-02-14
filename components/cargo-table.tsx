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

export function CargoTable({ cargos, onLoadCargo, onEditCargo, onToast, kullaniciSube, subeAyarlar }: CargoTableProps) {
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
    onToast?.("Barkod yazd\u0131r\u0131l\u0131yor")

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

    const printWindow = window.open("", "_blank", "width=500,height=600")
    if (printWindow) {
      printWindow.document.write("<!DOCTYPE html>\n<html>\n<head><meta charset=\"utf-8\"><title>Barkod - " + cargo.trackingNo + "</title>\n<style>\n  @page { margin: 0; size: 100mm 70mm; }\n  * { margin: 0; padding: 0; box-sizing: border-box; }\n  body { font-family: Arial, Helvetica, sans-serif; width: 100mm; height: 70mm; padding: 2.5mm; overflow: hidden; }\n  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5mm; }\n  .dest-city { font-size: 20pt; font-weight: bold; letter-spacing: 0.5px; line-height: 1.1; }\n  .gonderim-kodu { font-size: 9pt; font-weight: bold; text-align: right; }\n  .from-city { font-size: 10pt; margin-bottom: 0.3mm; }\n  .tracking-no { font-size: 13pt; font-weight: bold; text-align: right; letter-spacing: 1px; }\n  .hat-name { font-size: 10pt; font-weight: bold; margin-bottom: 1mm; }\n  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 1mm; font-size: 7pt; }\n  .info-table td, .info-table th { border: 0.5px solid #000; padding: 1mm 1.5mm; vertical-align: top; }\n  .info-table .section-header { text-align: center; font-weight: bold; font-size: 7pt; background: #e8e8e8; padding: 0.8mm; }\n  .info-table .label { font-weight: bold; width: 28mm; white-space: nowrap; }\n  .sender-info { line-height: 1.4; font-size: 7pt; }\n  .footer { font-size: 6.5pt; text-align: center; margin-top: 1mm; border-top: 0.5px solid #000; padding-top: 0.8mm; }\n</style>\n</head>\n<body>\n  <div class=\"header\">\n    <div>\n      <div class=\"dest-city\">" + destCity.toUpperCase() + "</div>\n      <div class=\"from-city\">" + fromCity.toUpperCase() + "</div>\n    </div>\n    <div style=\"text-align:right\">\n      <div class=\"gonderim-kodu\">" + gonderimKodu + "</div>\n      <div class=\"tracking-no\">" + cargo.trackingNo + "</div>\n    </div>\n  </div>\n\n  <div class=\"hat-name\">" + hatName + "</div>\n\n  <table class=\"info-table\">\n    <tr>\n      <td colspan=\"2\" class=\"section-header\">G\u00d6NDER\u0130C\u0130 B\u0130LG\u0130LER\u0130</td>\n      <td class=\"label\">Tarih</td>\n      <td>" + today + "</td>\n    </tr>\n    <tr>\n      <td colspan=\"2\" rowspan=\"3\" class=\"sender-info\">" + cargo.sender + "<br>" + senderPhone + "<br>" + cargo.from + "</td>\n      <td class=\"label\">T\u00fcr\u00fc</td>\n      <td>Paket</td>\n    </tr>\n    <tr>\n      <td class=\"label\">KG/DS</td>\n      <td>-</td>\n    </tr>\n    <tr>\n      <td class=\"label\">Adet</td>\n      <td>" + cargo.pieces + "/1</td>\n    </tr>\n    <tr>\n      <td colspan=\"4\" class=\"section-header\">ALICI B\u0130LG\u0130LER\u0130</td>\n    </tr>\n    <tr>\n      <td colspan=\"4\" class=\"sender-info\">" + cargo.receiver + "<br>" + receiverPhone + "<br>" + cargo.to + "</td>\n    </tr>\n  </table>\n\n  <div class=\"footer\">" + footerText + "</div>\n\n  <script>window.onload = function() { window.print(); }<\/script>\n</body>\n</html>")
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
              <TableHead className="w-[80px]"></TableHead>
              <TableHead className="font-semibold text-foreground">Takip No</TableHead>
              <TableHead className="w-[60px] text-center font-semibold text-foreground">{"Par\u00e7a"}</TableHead>
              <TableHead className="font-semibold text-foreground">{"G\u00f6nderici"}</TableHead>
              <TableHead className="font-semibold text-foreground">{"Al\u0131c\u0131"}</TableHead>
              <TableHead className="font-semibold text-foreground">Nereden</TableHead>
              <TableHead className="font-semibold text-foreground">Nereye</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Tutar</TableHead>
              <TableHead className="text-center font-semibold text-foreground">
                <div>Sefer Hareket</div><div>Tarihi</div>
              </TableHead>
              <TableHead className="text-center font-semibold text-foreground">
                <div>{"Sefer Var\u0131\u015f"}</div><div>Tarihi</div>
              </TableHead>
              <TableHead className="font-semibold text-foreground">Plaka</TableHead>
              <TableHead className="font-semibold text-foreground">Firma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="py-12 text-center text-muted-foreground">
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
                        aria-label="Kargo bilgileri d\u00fczenle"
                        title="Kargo Bilgileri D\u00fczenle"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handlePrintBarcode(cargo)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                        aria-label="Barkod yazd\u0131r"
                        title="Barkod Yazd\u0131r"
                      >
                        <Barcode className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleCopyTracking(cargo.trackingNo, cargo.id)}
                      className="group flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="T\u0131klayarak kopyala"
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
                  <TableCell className="whitespace-nowrap text-sm text-foreground">{cargo.plate || "-"}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-foreground">{cargo.firma || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
