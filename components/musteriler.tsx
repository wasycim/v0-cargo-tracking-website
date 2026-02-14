"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Send, UserPlus, Search, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

export interface SavedCustomer {
  tc: string
  ad: string
  soyad: string
  telefon: string
  email?: string
  durum: "aktif" | "pasif"
}

interface MusterilerProps {
  customers: SavedCustomer[]
  onCustomerSaved: (customer: SavedCustomer) => void
  onToast: (message: string) => void
}

/* ---- MUSTERI EKLE MODAL ---- */
function MusteriEkleModal({ onClose, onSave }: { onClose: () => void; onSave: (c: SavedCustomer) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [tc, setTc] = useState("")
  const [ad, setAd] = useState("")
  const [soyad, setSoyad] = useState("")
  const [telefon, setTelefon] = useState("")
  const [email, setEmail] = useState("")
  const [dogrulamaKodu, setDogrulamaKodu] = useState("")
  const [sentCode, setSentCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isCodeVerified, setIsCodeVerified] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [codeError, setCodeError] = useState("")
  const [durum, setDurum] = useState<"aktif" | "pasif">("aktif")

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, "")
    return /^5\d{9}$/.test(cleaned)
  }

  const handleSendCode = () => {
    setPhoneError("")
    if (!validatePhone(telefon)) {
      setPhoneError("Gecerli bir telefon numarasi girin (5XX XXX XX XX)")
      return
    }
    const code = String(Math.floor(1000 + Math.random() * 9000))
    setSentCode(code)
    setIsCodeSent(true)
    setCodeError("")
    alert(`Dogrulama kodu gonderildi: ${code}`)
  }

  const handleVerifyCode = () => {
    if (dogrulamaKodu === sentCode) {
      setIsCodeVerified(true)
      setCodeError("")
    } else {
      setCodeError("Kod hatali, tekrar deneyin")
      setIsCodeVerified(false)
    }
  }

  const handleSave = () => {
    if (!tc || !ad || !soyad || !telefon) {
      alert("Lutfen TC, Ad, Soyad ve Telefon alanlarini doldurun")
      return
    }
    if (!validatePhone(telefon)) {
      setPhoneError("Gecerli bir telefon numarasi girin")
      return
    }
    onSave({ tc, ad, soyad, telefon, email: email || undefined, durum })
    handleClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isVisible && !isClosing ? "bg-black/40 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className={`w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl transition-all duration-300 ease-out ${
          isVisible && !isClosing ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Musteri Ekle</h3>
          <button onClick={handleClose} className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Kapat">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              {"Musteri Tipi"} <span className="text-destructive">*</span>
            </label>
            <span className="inline-block rounded-md bg-cargo-dark px-5 py-2 text-xs font-medium text-white">Gercek Kisi</span>
          </div>

          <div className="mb-3">
            <Input placeholder="TC Kimlik Numarasi" value={tc} onChange={(e) => setTc(e.target.value.replace(/\D/g, "").slice(0, 11))} className="border-border bg-background" maxLength={11} />
          </div>
          <div className="mb-3 flex gap-3">
            <Input placeholder="Ad" value={ad} onChange={(e) => setAd(e.target.value)} className="border-border bg-background" />
            <Input placeholder="Soyad" value={soyad} onChange={(e) => setSoyad(e.target.value)} className="border-border bg-background" />
          </div>
          <div className="mb-3 flex gap-3">
            <Input
              placeholder="5XX XXX XX XX"
              value={telefon}
              onChange={(e) => { setTelefon(e.target.value.replace(/\D/g, "").slice(0, 10)); setPhoneError("") }}
              className={`border-border bg-background ${phoneError ? "border-destructive" : ""}`}
              maxLength={10}
            />
            <Input placeholder="Mail Adresi" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-border bg-background" />
          </div>
          {phoneError && (
            <p className="mb-2 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />{phoneError}</p>
          )}

          <div className="mb-3 flex items-center gap-2">
            <button onClick={handleSendCode} className="flex items-center gap-2 whitespace-nowrap rounded-md bg-cargo-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cargo-green">
              <Send className="h-3.5 w-3.5" />
              Dogrulama Kodu Gonder
            </button>
            <Input
              placeholder="Dogrulama Kodu"
              value={dogrulamaKodu}
              onChange={(e) => { setDogrulamaKodu(e.target.value.replace(/\D/g, "").slice(0, 4)); setCodeError("") }}
              disabled={!isCodeSent}
              className={`flex-1 border-border bg-background transition-colors ${
                isCodeVerified ? "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : ""
              }`}
              maxLength={4}
              onKeyDown={(e) => { if (e.key === "Enter") handleVerifyCode() }}
            />
            {isCodeSent && (
              <button
                onClick={handleVerifyCode}
                disabled={dogrulamaKodu.length < 4}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-all ${
                  isCodeVerified ? "border-emerald-500 bg-emerald-500 text-white" : "border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
                }`}
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
          {isCodeVerified && (
            <p className="mb-3 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"><Check className="h-3 w-3" />Kod basariyla dogrulandi</p>
          )}
          {codeError && (
            <p className="mb-3 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />{codeError}</p>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {"Durum"} <span className="text-destructive">*</span>
            </label>
            <select
              value={durum}
              onChange={(e) => setDurum(e.target.value as "aktif" | "pasif")}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-cargo-green"
            >
              <option value="aktif">Aktif</option>
              <option value="pasif">Pasif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <button onClick={handleClose} className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Iptal</button>
          <button onClick={handleSave} className="rounded-md bg-cargo-green px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-cargo-dark">Olustur</button>
        </div>
      </div>
    </div>
  )
}

/* ---- MUSTERI ARA MODAL ---- */
function MusteriAraModal({ onClose, customers }: { onClose: () => void; customers: SavedCustomer[] }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [searchTc, setSearchTc] = useState("")
  const [searchTel, setSearchTel] = useState("")
  const [results, setResults] = useState<SavedCustomer[]>([])
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const handleSearch = () => {
    setSearched(true)
    const found = customers.filter((c) => {
      if (searchTc && c.tc.includes(searchTc)) return true
      if (searchTel && c.telefon.includes(searchTel)) return true
      return false
    })
    setResults(found)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isVisible && !isClosing ? "bg-black/40 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className={`w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl transition-all duration-300 ease-out ${
          isVisible && !isClosing ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Musteri</h3>
          <button onClick={handleClose} className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Kapat">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="mb-3 flex gap-3">
            <Input placeholder="T.C. Kimlik No" value={searchTc} onChange={(e) => setSearchTc(e.target.value.replace(/\D/g, ""))} className="border-border bg-background" />
            <Input placeholder="Telefon" value={searchTel} onChange={(e) => setSearchTel(e.target.value.replace(/\D/g, ""))} className="border-border bg-background" />
          </div>
          <button onClick={handleSearch} className="mb-4 flex w-full items-center justify-center gap-2 rounded-md bg-cargo-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cargo-green">
            <Search className="h-4 w-4" />
            Ara
          </button>

          {searched && results.length === 0 && (
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">Musteri bulunamadi.</div>
          )}

          {results.length > 0 && (
            <div className="max-h-60 divide-y divide-border overflow-y-auto rounded-lg border border-border">
              {results.map((c) => (
                <div key={c.tc} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.ad} {c.soyad}</p>
                    <p className="text-xs text-muted-foreground">TC: {c.tc} | Tel: {c.telefon}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.durum === "aktif" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {c.durum === "aktif" ? "Aktif" : "Pasif"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-border px-5 py-3">
          <button onClick={handleClose} className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Iptal</button>
        </div>
      </div>
    </div>
  )
}

/* ---- MAIN MUSTERILER PAGE ---- */
export function Musteriler({ customers, onCustomerSaved, onToast }: MusterilerProps) {
  const [showEkle, setShowEkle] = useState(false)
  const [showAra, setShowAra] = useState(false)

  const handleSave = (c: SavedCustomer) => {
    onCustomerSaved(c)
    onToast("Musteri eklendi")
  }

  return (
    <div className="p-4">
      <h1 className="mb-6 text-xl font-bold text-foreground">Musteriler</h1>
      <div className="flex flex-wrap gap-4">
        <button onClick={() => setShowAra(true)} className="rounded-lg border border-border bg-card px-10 py-4 text-sm font-medium text-foreground transition-all hover:border-cargo-green hover:shadow-md">
          <Search className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
          Musteri Ara
        </button>
        <button onClick={() => setShowEkle(true)} className="rounded-lg border border-border bg-card px-10 py-4 text-sm font-medium text-foreground transition-all hover:border-cargo-green hover:shadow-md">
          <UserPlus className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
          Musteri Ekle
        </button>
      </div>

      {showEkle && <MusteriEkleModal onClose={() => setShowEkle(false)} onSave={handleSave} />}
      {showAra && <MusteriAraModal onClose={() => setShowAra(false)} customers={customers} />}
    </div>
  )
}
