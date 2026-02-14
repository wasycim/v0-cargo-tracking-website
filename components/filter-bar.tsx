"use client"

import { Checkbox } from "@/components/ui/checkbox"

interface FilterBarProps {
  filters: {
    yolda: boolean
    devir: boolean
    giden: boolean
    eskiAktif: boolean
    teslim: boolean
    iptal: boolean
  }
  onFilterChange: (key: string, value: boolean) => void
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={filters.yolda}
            onCheckedChange={(v) => onFilterChange("yolda", v as boolean)}
          />
          Yolda
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={filters.devir}
            onCheckedChange={(v) => onFilterChange("devir", v as boolean)}
          />
          Devir
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={filters.giden}
            onCheckedChange={(v) => onFilterChange("giden", v as boolean)}
          />
          Giden
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={filters.eskiAktif}
          onCheckedChange={(v) => onFilterChange("eskiAktif", v as boolean)}
        />
        Bir aydan eski aktif kargolari listele.
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={filters.teslim}
          onCheckedChange={(v) => onFilterChange("teslim", v as boolean)}
        />
        Bir ay icerisinde teslim edilenleri goster.
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={filters.iptal}
          onCheckedChange={(v) => onFilterChange("iptal", v as boolean)}
        />
        Bir ay icerisinde iptal edilenleri goster.
      </label>
    </div>
  )
}
