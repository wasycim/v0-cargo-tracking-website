"use client"

import { Checkbox } from "@/components/ui/checkbox"

interface FilterBarProps {
  filters: {
    giden: boolean
    eskiAktif: boolean
    iptal: boolean
  }
  onFilterChange: (key: string, value: boolean) => void
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-border bg-card px-4 py-3">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox
          checked={filters.giden}
          onCheckedChange={(v) => onFilterChange("giden", v as boolean)}
        />
        Giden
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={filters.eskiAktif}
          onCheckedChange={(v) => onFilterChange("eskiAktif", v as boolean)}
        />
        Eski Kargolari Goruntule
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={filters.iptal}
          onCheckedChange={(v) => onFilterChange("iptal", v as boolean)}
        />
        Iptal edilenleri goster
      </label>
    </div>
  )
}
