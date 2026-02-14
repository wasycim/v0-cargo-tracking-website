"use client"

import { Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export type AppPage = "anasayfa" | "kargolar" | "musteriler" | "kasaislemleri" | "raporlar"

const navItems: { label: string; id: AppPage }[] = [
  { label: "Ana Sayfa", id: "anasayfa" },
  { label: "Kargolar", id: "kargolar" },
  { label: "Musteriler", id: "musteriler" },
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
      <div className="flex items-center overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              activePage === item.id
                ? "border-b-2 border-cargo-green text-cargo-green"
                : "text-foreground hover:text-cargo-green"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
          aria-label="Tema degistir"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </button>
      )}
    </nav>
  )
}
