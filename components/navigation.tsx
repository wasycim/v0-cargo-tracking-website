"use client"

import { Sun, Moon, Settings, LogOut, User } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export type AppPage = "anasayfa" | "kargolar" | "musteriler" | "kasaislemleri" | "raporlar" | "ayarlar"

const navItems: { label: string; id: AppPage }[] = [
  { label: "Ana Sayfa", id: "anasayfa" },
  { label: "Kargolar", id: "kargolar" },
  { label: "Müşteriler", id: "musteriler" },
  { label: "Kasa İşlemleri", id: "kasaislemleri" },
  { label: "Raporlar", id: "raporlar" },
]

interface NavigationProps {
  activePage: AppPage
  onPageChange: (page: AppPage) => void
  kullaniciAd?: string
  kullaniciSoyad?: string
  kullaniciSube?: string
  onLogout?: () => void
}

export function Navigation({ activePage, onPageChange, kullaniciAd, kullaniciSoyad, kullaniciSube, onLogout }: NavigationProps) {
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
      <div className="flex items-center gap-2">
        {/* Kullanıcı Bilgisi */}
        {kullaniciAd && (
          <div className="mr-2 hidden items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 sm:flex">
            <User className="h-3.5 w-3.5 text-cargo-green" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold leading-tight text-foreground">
                {kullaniciAd} {kullaniciSoyad}
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                {kullaniciSube} Şubesi
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => onPageChange("ayarlar")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activePage === "ayarlar"
              ? "bg-cargo-green/10 text-cargo-green"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          aria-label="Ayarlar"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Ayarlar</span>
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
            aria-label="Tema değiştir"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
            aria-label="Çıkış yap"
            title="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </nav>
  )
}
