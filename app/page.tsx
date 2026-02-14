"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Package, Ban } from "lucide-react"
import { LoginPage } from "@/components/login-page"
import type { KullaniciInfo } from "@/components/login-page"
import { ForgotPasswordPage } from "@/components/forgot-password-page"
import { Navigation } from "@/components/navigation"
import type { AppPage } from "@/components/navigation"
import { AnaSayfa } from "@/components/ana-sayfa"
import { StatusSummary } from "@/components/status-summary"
import { FilterBar } from "@/components/filter-bar"
import { CargoTable } from "@/components/cargo-table"
import { NewCargoForm } from "@/components/new-cargo-form"
import { LoadCargoForm } from "@/components/load-cargo-form"
import { EditCargoForm } from "@/components/edit-cargo-form"
import { CancelCargoForm } from "@/components/cancel-cargo-form"
import { Musteriler } from "@/components/musteriler"
import type { SavedCustomer } from "@/components/musteriler"
import { KasaIslemleri } from "@/components/kasa-islemleri"
import { Raporlar } from "@/components/raporlar"
import { Ayarlar } from "@/components/ayarlar"
import { ToastNotification } from "@/components/toast-notification"
import type { Cargo } from "@/lib/cargo-data"

interface SubeAyarlar {
  peron_no?: string
  sirket_telefon?: string
}

export default function Page() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [kullanici, setKullanici] = useState<KullaniciInfo | null>(null)

  // App page
  const [activePage, setActivePage] = useState<AppPage>("kargolar")

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Saved customers
  const [savedCustomers, setSavedCustomers] = useState<SavedCustomer[]>([])

  // Sube ayarlar
  const [subeAyarlar, setSubeAyarlar] = useState<SubeAyarlar | null>(null)

  // Cargo state
  const [showNewCargoForm, setShowNewCargoForm] = useState(false)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [loadingCargo, setLoadingCargo] = useState<{ id: string; trackingNo: string } | null>(null)
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null)
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [filters, setFilters] = useState({
    giden: true,
    eskiAktif: false,
    iptal: false,
  })

  // Check for remembered user on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kargo_user")
      if (saved) {
        const user = JSON.parse(saved) as KullaniciInfo
        setKullanici(user)
        setIsLoggedIn(true)
      }
    } catch { /* ignore */ }
  }, [])

  // Load cargos from DB when user logs in
  useEffect(() => {
    if (!isLoggedIn || !kullanici?.sube) return
    const loadCargos = async () => {
      try {
        const res = await fetch(`/api/kargolar?sube=${encodeURIComponent(kullanici.sube)}`)
        const data = await res.json()
        if (data.cargos && data.cargos.length > 0) {
          setCargos(data.cargos)
        }
      } catch { /* ignore */ }
    }
    loadCargos()
  }, [isLoggedIn, kullanici?.sube])

  // Load sube ayarlar
  useEffect(() => {
    if (!isLoggedIn || !kullanici?.sube) return
    const loadAyarlar = async () => {
      try {
        const res = await fetch(`/api/ayarlar?sube=${encodeURIComponent(kullanici.sube)}`)
        const data = await res.json()
        if (data.ayarlar) {
          setSubeAyarlar({ peron_no: data.ayarlar.peron_no, sirket_telefon: data.ayarlar.sirket_telefon })
        }
      } catch { /* ignore */ }
    }
    loadAyarlar()
  }, [isLoggedIn, kullanici?.sube])

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
  }, [])

  const handleLogin = useCallback((user: KullaniciInfo) => {
    setKullanici(user)
    setIsLoggedIn(true)
  }, [])

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false)
    setKullanici(null)
    localStorage.removeItem("kargo_user")
    setCargos([])
    setSubeAyarlar(null)
  }, [])

  const filteredCargos = useMemo(() => {
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    return cargos.filter((cargo) => {
      if (!filters.eskiAktif && cargo.createdAt) {
        const created = new Date(cargo.createdAt)
        if (created < oneMonthAgo) return false
      }
      if (cargo.status === "yuklenecek") return true
      if (cargo.status === "giden" && !filters.giden) return false
      if (cargo.status === "iptal" && !filters.iptal) return false
      if (cargo.status === "teslim") return false
      return true
    })
  }, [filters, cargos])

  const handleFilterChange = (key: string, value: boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const kasaTutari = useMemo(() => {
    return filteredCargos
      .filter((c) => c.status !== "iptal" && c.status !== "teslim")
      .reduce((sum, cargo) => sum + cargo.amount, 0)
  }, [filteredCargos])

  // Save cargo to DB and return the real DB id
  const saveCargoDB = useCallback(async (cargo: Cargo): Promise<string | null> => {
    if (!kullanici?.sube) return null
    try {
      const res = await fetch("/api/kargolar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cargo, sube: kullanici.sube, kullanici_id: kullanici.id }),
      })
      const data = await res.json()
      return data.cargo?.id || null
    } catch { return null }
  }, [kullanici])

  // Update cargo in DB
  const updateCargoDB = useCallback(async (id: string, updates: Partial<Cargo>) => {
    try {
      await fetch("/api/kargolar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })
    } catch { /* ignore */ }
  }, [])

  const handleNewCargoSubmit = useCallback(async (newCargo: Cargo) => {
    // Add to local state immediately with temp id
    const tempId = newCargo.id
    setCargos((prev) => [newCargo, ...prev])
    showToast("Kargo ba\u015far\u0131yla eklendi")

    // Save to DB, get real id back
    const dbId = await saveCargoDB(newCargo)
    if (dbId && dbId !== tempId) {
      setCargos((prev) => prev.map((c) => c.id === tempId ? { ...c, id: dbId } : c))
    }
  }, [showToast, saveCargoDB])

  const handleCustomerSavedFromForm = useCallback((customer: { tc: string; ad: string; soyad: string; telefon: string; email?: string }) => {
    setSavedCustomers((prev) => {
      const exists = prev.find((c) => c.tc === customer.tc)
      const full: SavedCustomer = { ...customer, durum: "aktif" }
      if (exists) return prev.map((c) => (c.tc === customer.tc ? full : c))
      return [...prev, full]
    })
    showToast("Müşteri eklendi")
  }, [showToast])

  const handleCustomerSavedFromPage = useCallback((customer: SavedCustomer) => {
    setSavedCustomers((prev) => {
      const exists = prev.find((c) => c.tc === customer.tc)
      if (exists) return prev.map((c) => (c.tc === customer.tc ? customer : c))
      return [...prev, customer]
    })
  }, [])

  const handleLoadCargo = useCallback((cargoId: string, trackingNo: string) => {
    setLoadingCargo({ id: cargoId, trackingNo })
  }, [])

  const handleLoadSubmit = useCallback(
    (cargoId: string, data: { firma: string; kalkisSaati: string; varisSaati: string; plaka: string; aracTelefon: string }) => {
      const now = new Date()
      const dateStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
      const updates = {
        status: "giden" as const,
        departureTime: data.kalkisSaati,
        departureDate: dateStr,
        arrivalTime: data.varisSaati,
        arrivalDate: dateStr,
        plate: data.plaka,
        firma: data.firma,
        aracTelefon: data.aracTelefon,
      }
      setCargos((prev) => prev.map((c) => c.id === cargoId ? { ...c, ...updates } : c))
      updateCargoDB(cargoId, updates)
      setLoadingCargo(null)
      showToast("Kargo yüklendi")
    },
    [showToast, updateCargoDB]
  )

  const handleEditSubmit = useCallback(
    (cargoId: string, data: Partial<Cargo>) => {
      setCargos((prev) => prev.map((c) => (c.id === cargoId ? { ...c, ...data } : c)))
      updateCargoDB(cargoId, data)
      setEditingCargo(null)
      showToast("Kargo bilgileri güncellendi")
    },
    [showToast, updateCargoDB]
  )

  const handleCancelCargo = useCallback(
    (cargoId: string) => {
      setCargos((prev) => prev.map((c) => (c.id === cargoId ? { ...c, status: "iptal" as const } : c)))
      updateCargoDB(cargoId, { status: "iptal" })
      showToast("Kargo iptal edildi")
    },
    [showToast, updateCargoDB]
  )

  // Login screens
  if (!isLoggedIn) {
    if (showForgotPassword) {
      return (
        <>
          <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />
          {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
      )
    }
    return (
      <>
        <LoginPage onLogin={handleLogin} onForgotPassword={() => setShowForgotPassword(true)} />
        {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation
        activePage={activePage}
        onPageChange={setActivePage}
        kullaniciAd={kullanici?.ad}
        kullaniciSoyad={kullanici?.soyad}
        kullaniciSube={kullanici?.sube}
        onLogout={handleLogout}
      />

      {activePage === "anasayfa" && <AnaSayfa cargos={cargos} kasaTutari={kasaTutari} />}

      {activePage === "kargolar" && (
        <>
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
            <button
              onClick={() => setShowNewCargoForm(true)}
              className="flex items-center gap-2 rounded-lg border-2 border-cargo-green bg-cargo-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cargo-dark hover:shadow-md active:scale-95"
            >
              <Package className="h-5 w-5" />
              Yeni Kargo
            </button>
            <button
              onClick={() => setShowCancelForm(true)}
              className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-card px-5 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive hover:text-white active:scale-95"
            >
              <Ban className="h-4 w-4" />
              Kargo İptal
            </button>
          </div>

          <StatusSummary cargos={cargos} kasaTutari={kasaTutari} />
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          <CargoTable
            cargos={filteredCargos}
            onLoadCargo={handleLoadCargo}
            onEditCargo={setEditingCargo}
            onToast={(msg) => showToast(msg)}
            kullaniciSube={kullanici?.sube}
            subeAyarlar={subeAyarlar}
          />
        </>
      )}

      {activePage === "musteriler" && (
        <Musteriler
          customers={savedCustomers}
          onCustomerSaved={handleCustomerSavedFromPage}
          onToast={(msg) => showToast(msg)}
        />
      )}

      {activePage === "kasaislemleri" && <KasaIslemleri cargos={cargos} kullaniciSube={kullanici?.sube} />}
      {activePage === "raporlar" && <Raporlar cargos={cargos} />}
      {activePage === "ayarlar" && (
        <Ayarlar
          onToast={(msg) => showToast(msg)}
          kullaniciSube={kullanici?.sube}
          onAyarlarSaved={(a) => setSubeAyarlar(a)}
        />
      )}

      {showNewCargoForm && (
        <NewCargoForm
          onClose={() => setShowNewCargoForm(false)}
          onSubmit={handleNewCargoSubmit}
          onCustomerSaved={handleCustomerSavedFromForm}
          savedCustomers={savedCustomers}
          kullaniciSube={kullanici?.sube}
        />
      )}

      {loadingCargo && (
        <LoadCargoForm
          cargoId={loadingCargo.id}
          trackingNo={loadingCargo.trackingNo}
          onClose={() => setLoadingCargo(null)}
          onSubmit={handleLoadSubmit}
        />
      )}

      {editingCargo && (
        <EditCargoForm
          cargo={editingCargo}
          onClose={() => setEditingCargo(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {showCancelForm && (
        <CancelCargoForm
          cargos={cargos}
          onClose={() => setShowCancelForm(false)}
          onCancel={handleCancelCargo}
        />
      )}

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}
