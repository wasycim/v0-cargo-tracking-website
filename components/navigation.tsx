"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Ana Sayfa", href: "#" },
  { label: "Kargolar", href: "#", active: true },
  { label: "Musteriler", href: "#", hasDropdown: true },
  { label: "Kasa Islemleri", href: "#" },
  { label: "Raporlar", href: "#", hasDropdown: true },
  { label: "Calisma Saatleri", href: "#" },
  { label: "TTI Yazdir (Yeni)", href: "#" },
]

export function Navigation() {
  const [activeItem, setActiveItem] = useState("Kargolar")

  return (
    <nav className="flex items-center border-b border-border bg-card px-4" role="navigation" aria-label="Ana navigasyon">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => setActiveItem(item.label)}
          className={`flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeItem === item.label
              ? "border-b-2 border-cargo-green text-cargo-green"
              : "text-foreground hover:text-cargo-green"
          }`}
        >
          {item.label}
          {item.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      ))}
    </nav>
  )
}
