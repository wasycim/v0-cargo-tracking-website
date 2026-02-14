"use client"

import { Menu, RefreshCw, RotateCcw } from "lucide-react"
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
import { useState, useEffect } from "react"

interface CargoTableProps {
  cargos: Cargo[]
  onLoadCargo?: (cargoId: string, trackingNo: string) => void
}

function StatusBadge({ status }: { status: Cargo["status"] }) {
  const colors = statusColors[status]
  const label = statusLabels[status]

  return (
    <span
      className={`inline-block rounded px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}
    >
      {label}
    </span>
  )
}

export function CargoTable({ cargos, onLoadCargo }: CargoTableProps) {
  const [countdown, setCountdown] = useState(184)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 184 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="px-4 pb-4">
      <div className="mb-2 flex items-center justify-end gap-4 py-2 text-sm text-muted-foreground">
        <span>
          Liste {countdown} sn. sonra yenilenecek.
        </span>
        <button
          onClick={() => setCountdown(184)}
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Sifirla
        </button>
        <button
          onClick={() => setCountdown(184)}
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Yenile
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px] text-center font-semibold text-foreground">Kargo Durum</TableHead>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead className="font-semibold text-foreground">Takip No</TableHead>
              <TableHead className="w-[60px] text-center font-semibold text-foreground">Parca</TableHead>
              <TableHead className="font-semibold text-foreground">Gonderici</TableHead>
              <TableHead className="font-semibold text-foreground">Alici</TableHead>
              <TableHead className="font-semibold text-foreground">Nereden</TableHead>
              <TableHead className="font-semibold text-foreground">Nereye</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Tutar</TableHead>
              <TableHead className="text-center font-semibold text-foreground">
                <div>Sefer</div>
                <div>Hareket</div>
                <div>Tarihi</div>
              </TableHead>
              <TableHead className="text-center font-semibold text-foreground">
                <div>Sefer</div>
                <div>Varis</div>
                <div>Tarihi</div>
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
                <TableRow
                  key={cargo.id}
                  className={`${index % 2 === 0 ? "bg-card" : "bg-muted/30"} transition-colors hover:bg-muted/50`}
                >
                  <TableCell className="text-center">
                    <StatusBadge status={cargo.status} />
                  </TableCell>
                  <TableCell>
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
                      <span className="text-muted-foreground/40">
                        <Menu className="h-4 w-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="cursor-pointer text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      {cargo.trackingNo}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-foreground">{cargo.pieces}</TableCell>
                  <TableCell className="max-w-[250px] text-sm text-foreground">
                    {cargo.sender.split("\n").map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {cargo.receiver.split("\n").map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
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
                      <div>{cargo.departureDate}</div>
                      <div>{cargo.departureTime}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs text-foreground">
                    <div>{cargo.arrivalDate}</div>
                    <div>{cargo.arrivalTime}</div>
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
