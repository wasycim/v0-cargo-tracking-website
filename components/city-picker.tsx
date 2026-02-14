"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronDown, X, MapPin } from "lucide-react"
import { turkeyLocations } from "@/lib/cargo-data"

interface CityPickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CityPicker({ value, onChange, placeholder = "Il / Ilce secin" }: CityPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
        setSelectedCity("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCities = useMemo(() => {
    if (!search) return Object.keys(turkeyLocations).sort()
    const s = search.toLowerCase()
    const results: { type: "city" | "district"; city: string; district?: string; label: string }[] = []

    for (const city of Object.keys(turkeyLocations)) {
      if (city.toLowerCase().includes(s)) {
        results.push({ type: "city", city, label: city })
      }
      for (const district of turkeyLocations[city]) {
        if (district.toLowerCase().includes(s)) {
          results.push({ type: "district", city, district, label: `${city} / ${district}` })
        }
      }
    }
    return results
  }, [search])

  const districts = useMemo(() => {
    if (!selectedCity) return []
    return turkeyLocations[selectedCity] || []
  }, [selectedCity])

  const handleSelectCity = (city: string) => {
    setSelectedCity(city)
  }

  const handleSelectDistrict = (city: string, district: string) => {
    onChange(`${city} / ${district}`)
    setOpen(false)
    setSearch("")
    setSelectedCity("")
  }

  const handleSelectCityOnly = (city: string) => {
    onChange(city)
    setOpen(false)
    setSearch("")
    setSelectedCity("")
  }

  const handleClear = () => {
    onChange("")
    setSearch("")
    setSelectedCity("")
  }

  return (
    <div ref={ref} className="relative">
      <div
        className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
        onClick={() => {
          setOpen(!open)
          if (!open) setTimeout(() => inputRef.current?.focus(), 50)
        }}
      >
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        {value ? (
          <span className="flex-1 text-foreground">{value}</span>
        ) : (
          <span className="flex-1 text-muted-foreground">{placeholder}</span>
        )}
        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="border-b border-border p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Il veya ilce ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedCity("")
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-cargo-green focus:ring-1 focus:ring-cargo-green"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {search ? (
              /* Search mode - show matching cities and districts */
              filteredCities.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">Sonuc bulunamadi</div>
              ) : (
                filteredCities.slice(0, 30).map((item, i) => (
                  <button
                    key={`${item.label}-${i}`}
                    onClick={() => {
                      if (item.type === "district") {
                        handleSelectDistrict(item.city, item.district!)
                      } else {
                        handleSelectCityOnly(item.city)
                      }
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {item.label}
                  </button>
                ))
              )
            ) : selectedCity ? (
              /* District selection mode */
              <>
                <button
                  onClick={() => setSelectedCity("")}
                  className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-xs font-semibold text-cargo-green hover:bg-muted"
                >
                  <ChevronDown className="h-3 w-3 rotate-90" />
                  Geri
                </button>
                <button
                  onClick={() => handleSelectCityOnly(selectedCity)}
                  className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-cargo-green/10"
                >
                  <MapPin className="h-3 w-3 text-cargo-green" />
                  {selectedCity} (Sadece il)
                </button>
                {districts.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleSelectDistrict(selectedCity, d)}
                    className="flex w-full items-center gap-2 px-3 py-2 pl-6 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {d}
                  </button>
                ))}
              </>
            ) : (
              /* City list mode */
              filteredCities.map((city) => (
                <button
                  key={typeof city === "string" ? city : city.label}
                  onClick={() => handleSelectCity(typeof city === "string" ? city : city.city)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <span>{typeof city === "string" ? city : city.label}</span>
                  <ChevronDown className="h-3 w-3 -rotate-90 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
