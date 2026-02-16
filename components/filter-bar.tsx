"use client"

import { Checkbox } from "@/components/ui/checkbox"

interface FilterBarProps {
  filters: {
    giden: boolean
    gonderildi: boolean
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

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox
          checked={filters.gonderildi}
          onCheckedChange={(v) => onFilterChange("gonderildi", v as boolean)}
        />
        {"G\u00f6nderildi"}
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={filters.eskiAktif}
          onCheckedChange={(v) => onFilterChange("eskiAktif", v as boolean)}
        />
        {"Eski Kargolar\u0131 G\u00f6r\u00fcnt\u00fcle"}
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={filters.iptal}
          onCheckedChange={(v) => onFilterChange("iptal", v as boolean)}
        />
        {"\u0130ptal edilenleri g\u00f6ster"}
      </label>
    </div>
  )
}
