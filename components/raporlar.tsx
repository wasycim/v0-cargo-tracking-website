"use client"

import { useState } from "react"
import { KargoRaporu } from "./kargo-raporu"
import { SubeCiroRaporu } from "./sube-ciro-raporu"
import { IadeKargolar } from "./iade-kargolar"

const tabs = [
  { id: "kargo", label: "Kargo Raporu" },
  { id: "ciro", label: "Sube Ciro Raporu" },
  { id: "iade", label: "Iade Kargolar" },
]

export function Raporlar() {
  const [activeTab, setActiveTab] = useState("kargo")

  return (
    <div className="p-4">
      <h1 className="mb-6 text-xl font-bold text-foreground">Raporlar</h1>

      {/* Tab Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg border px-6 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "border-cargo-green bg-cargo-green text-white shadow-sm"
                : "border-border bg-card text-foreground hover:border-cargo-green/50 hover:shadow-sm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "kargo" && <KargoRaporu />}
      {activeTab === "ciro" && <SubeCiroRaporu />}
      {activeTab === "iade" && <IadeKargolar />}
    </div>
  )
}
