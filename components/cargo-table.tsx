"use client"

import { Menu, RefreshCw, Pencil, Copy, Check } from "lucide-react"
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

interface CargoTableProps {
  cargos: Cargo[]
  onLoadCargo?: (cargoId: string, trackingNo: string) => void
  onEditCargo?: (cargo: Cargo) => void
  onToast?: (message: string) => void
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

export function CargoTable({ cargos, onLoadCargo, onEditCargo, onToast }: CargoTableProps) {
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
      onToast?.(`Takip No kopyalandi: ${trackingNo}`)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
      const el = document.createElement("textarea")
      el.value = trackingNo.replace(/\s/g, "")
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopiedId(cargoId)
      onToast?.(`Takip No kopyalandi: ${trackingNo}`)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }, [onToast])

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
              <TableHead className="w-[60px]"></TableHead>
              <TableHead className="font-semibold text-foreground">Takip No</TableHead>
              <TableHead className="w-[60px] text-center font-semibold text-foreground">Parca</TableHead>
              <TableHead className="font-semibold text-foreground">Gonderici</TableHead>
              <TableHead className="font-semibold text-foreground">Alici</TableHead>
              <TableHead className="font-semibold text-foreground">Nereden</TableHead>
              <TableHead className="font-semibold text-foreground">Nereye</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Tutar</TableHead>
              <TableHead className="text-center font-semibold text-foreground">
                <div>Sefer Hareket</div><div>Tarihi</div>
              </TableHead>
              <TableHead className="text-center font-semibold text-foreground">
                <div>Sefer Varis</div><div>Tarihi</div>
              </TableHead>
              <TableHead className="font-semibold text-foreground">Plaka</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="py-12 text-center text-muted-foreground">
                  Gosterilecek kargo bulunamadi.
                </TableCell>
              </TableRow>
            ) : (
              cargos.map((cargo, index) => (
                <TableRow key={cargo.id} className={`${index % 2 === 0 ? "bg-card" : "bg-muted/30"} transition-colors hover:bg-muted/50`}>
                  <TableCell className="text-center">
                    <StatusBadge status={cargo.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {cargo.status === "yuklenecek" ? (
                        <button
                          onClick={() => onLoadCargo?.(cargo.id, cargo.trackingNo)}
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-cargo-green/10 hover:text-cargo-green"
                          aria-label="Kargo yukle"
                          title="Kargo Yukle"
                        >
                          <Menu className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="p-1 text-muted-foreground/30"><Menu className="h-4 w-4" /></span>
                      )}
                      <button
                        onClick={() => onEditCargo?.(cargo)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                        aria-label="Kargo bilgileri duzenle"
                        title="Kargo Bilgileri Duzenle"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleCopyTracking(cargo.trackingNo, cargo.id)}
                      className="group flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Tiklayarak kopyala"
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
