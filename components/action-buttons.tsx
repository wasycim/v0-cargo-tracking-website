"use client"

import { useState } from "react"
import {
  Package,
  Upload,
  Download,
  MapPin,
  CheckCircle,
  XCircle,
  CheckCheck,
} from "lucide-react"

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  variant?: "default" | "primary"
  active?: boolean
}

function ActionButton({ icon, label, onClick, variant = "default", active = false }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-lg border px-5 py-3 transition-all hover:shadow-md active:scale-95 ${
        active
          ? "border-cargo-green bg-cargo-green text-white shadow-md"
          : variant === "primary"
            ? "border-cargo-green bg-cargo-green text-white hover:bg-cargo-dark"
            : "border-border bg-card text-foreground hover:border-cargo-green"
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

interface ActionButtonsBarProps {
  onNewCargo: () => void
}

export function ActionButtonsBar({ onNewCargo }: ActionButtonsBarProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null)

  const handleAction = (action: string, callback?: () => void) => {
    setActiveAction(action)
    callback?.()
    if (action !== "yeniKargo") {
      setTimeout(() => setActiveAction(null), 1500)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-4">
      <ActionButton
        icon={<Package className="h-6 w-6" />}
        label="Yeni Kargo"
        onClick={() => handleAction("yeniKargo", onNewCargo)}
        active={activeAction === "yeniKargo"}
      />
      <ActionButton
        icon={<Upload className="h-6 w-6" />}
        label="Yukle"
        onClick={() => handleAction("yukle")}
        active={activeAction === "yukle"}
      />
      <ActionButton
        icon={<Download className="h-6 w-6" />}
        label="Indir"
        onClick={() => handleAction("indir")}
        active={activeAction === "indir"}
      />
      <ActionButton
        icon={<MapPin className="h-6 w-6" />}
        label="Takip"
        onClick={() => handleAction("takip")}
        active={activeAction === "takip"}
      />
      <ActionButton
        icon={<CheckCircle className="h-6 w-6" />}
        label="Teslim"
        onClick={() => handleAction("teslim")}
        active={activeAction === "teslim"}
      />
      <ActionButton
        icon={<XCircle className="h-6 w-6" />}
        label="Iptal"
        onClick={() => handleAction("iptal")}
        active={activeAction === "iptal"}
      />
      <ActionButton
        icon={<CheckCheck className="h-6 w-6" />}
        label="Hizmet Ici Teslim"
        variant="primary"
        onClick={() => handleAction("hizmetIci")}
        active={activeAction === "hizmetIci"}
      />
    </div>
  )
}
