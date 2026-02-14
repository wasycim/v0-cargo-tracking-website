"use client"

import { ChevronDown, Sun, Moon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"

export type AppPage = "anasayfa" | "kargolar" | "kasaislemleri" | "raporlar"

const navItems: { label: string; id: AppPage; hasDropdown?: boolean }[] = [
  { label: "Ana Sayfa", id: "anasayfa" },
  { label: "Kargolar", id: "kargolar" },
  { label: "Kasa Islemleri", id: "kasaislemleri" },
  { label: "Raporlar", id: "raporlar" },
]

interface NavigationProps {
  activePage: AppPage
  onPageChange: (page: AppPage) => void
}

export function Navigation({ activePage, onPageChange }: NavigationProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="flex items-center justify-between border-b border-border bg-card px-4" role="navigation" aria-label="Ana navigasyon">
      <div className="flex items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors ${
              activePage === item.id
                ? "border-b-2 border-cargo-green text-cargo-green"
                : "text-foreground hover:text-cargo-green"
            }`}
          >
            {item.label}
            {item.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        ))}
      </div>
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
          aria-label="Tema degistir"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </button>
      )}
    </nav>
  )
}
