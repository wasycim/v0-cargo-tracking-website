"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { X, Search, MapPin } from "lucide-react"
import { subeler } from "@/lib/subeler"

interface SubePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SubePicker({ value, onChange, placeholder = "Sube secin..." }: SubePickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // ESC ile kapat
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open])

  const filtered = useMemo(() => {
    if (!search) return subeler
    const s = search.toLowerCase()
    return subeler.filter(
      (b) =>
        b.sube.toLowerCase().includes(s) ||
        b.il.toLowerCase().includes(s) ||
        b.ilce.toLowerCase().includes(s)
    )
  }, [search])

  const handleSelect = (sube: typeof subeler[0]) => {
    onChange(`${sube.il} / ${sube.ilce}`)
    setOpen(false)
    setSearch("")
  }

  // Secili subenin adini goster
  const selectedSube = value ? subeler.find((s) => value === `${s.il} / ${s.ilce}`) : null
  const displayText = selectedSube ? selectedSube.sube : value

  return (
    <>
      <div
        className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-cargo-green"
        onClick={() => setOpen(true)}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {displayText ? (
          <span className="flex-1 truncate text-foreground">{displayText}</span>
        ) : (
          <span className="flex-1 text-muted-foreground">{placeholder}</span>
        )}
        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false)
              setSearch("")
            }
          }}
        >
          <div className="mx-4 w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-base font-semibold text-foreground">{"Sube Se\u00e7imi"}</h3>
              <button
                onClick={() => {
                  setOpen(false)
                  setSearch("")
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-border px-5 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-cargo-green focus:ring-1 focus:ring-cargo-green"
                />
              </div>
            </div>

            {/* Table */}
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-muted">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-foreground">{"Sube"}</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-foreground">{"Il"}</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-foreground">{"Il\u00e7e"}</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-foreground">{"Firma"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-center text-sm text-muted-foreground">
                        {"Sonu\u00e7 bulunamad\u0131"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((sube, i) => (
                      <tr
                        key={`${sube.sube}-${i}`}
                        onClick={() => handleSelect(sube)}
                        className="cursor-pointer border-b border-border/50 transition-colors hover:bg-cargo-green/10"
                      >
                        <td className="px-5 py-2.5 text-sm font-medium text-cargo-green">{sube.sube}</td>
                        <td className="px-5 py-2.5 text-sm text-foreground">{sube.il}</td>
                        <td className="px-5 py-2.5 text-sm text-foreground">{sube.ilce}</td>
                        <td className="px-5 py-2.5 text-sm text-foreground">{sube.firma}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
