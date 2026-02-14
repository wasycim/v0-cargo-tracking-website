"use client"

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
}

function ActionButton({ icon, label, onClick, variant = "default" }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-lg border px-6 py-4 transition-all hover:shadow-md ${
        variant === "primary"
          ? "border-cargo-green bg-cargo-green text-white hover:bg-cargo-dark"
          : "border-border bg-card text-foreground hover:border-cargo-green"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

interface ActionButtonsBarProps {
  onNewCargo: () => void
}

export function ActionButtonsBar({ onNewCargo }: ActionButtonsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-4">
      <ActionButton
        icon={<Package className="h-7 w-7" />}
        label="Yeni Kargo"
        onClick={onNewCargo}
        variant="default"
      />
      <ActionButton
        icon={<Upload className="h-7 w-7" />}
        label="Yukle"
      />
      <ActionButton
        icon={<Download className="h-7 w-7" />}
        label="Indir"
      />
      <ActionButton
        icon={<MapPin className="h-7 w-7" />}
        label="Takip"
      />
      <ActionButton
        icon={<CheckCircle className="h-7 w-7" />}
        label="Teslim"
      />
      <ActionButton
        icon={<XCircle className="h-7 w-7" />}
        label="Iptal"
      />
      <ActionButton
        icon={<CheckCheck className="h-7 w-7" />}
        label="Hizmet Ici Teslim"
        variant="primary"
      />
    </div>
  )
}
