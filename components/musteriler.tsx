"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Send, UserPlus, Search, Check, AlertCircle, Pencil } from "lucide-react"
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
  onCustomerUpdated?: (tc: string, updated: SavedCustomer) => void
  kullaniciSube?: string
  onToast: (message: string) => void
}

/* ---- MODAL WRAPPER ---- */
function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

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
        {typeof children === "function" ? (children as (close: () => void) => React.ReactNode)(handleClose) : children}
      </div>
    </div>
  )
}

/* ---- TELEFON DOGRULAMA ---- */
function PhoneVerification({ telefon, phoneError, setPhoneError }: { telefon: string; phoneError: string; setPhoneError: (e: string) => void }) {
  const [dogrulamaKodu, setDogrulamaKodu] = useState("")
  const [sentCode, setSentCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isCodeVerified, setIsCodeVerified] = useState(false)
  const [codeError, setCodeError] = useState("")

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, "")
    return /^5\d{9}$/.test(cleaned)
  }

  const handleSendCode = () => {
    setPhoneError("")
    if (!validatePhone(telefon)) {
      setPhoneError("Ge\u00e7erli bir telefon numaras\u0131 girin (5XX XXX XX XX)")
      return
    }
    const code = String(Math.floor(1000 + Math.random() * 9000))
    setSentCode(code)
    setIsCodeSent(true)
    setCodeError("")
    alert("Do\u011frulama kodu g\u00f6nderildi: " + code)
  }

  const handleVerifyCode = () => {
    if (dogrulamaKodu === sentCode) {
      setIsCodeVerified(true)
      setCodeError("")
    } else {
      setCodeError("Kod hatal\u0131, tekrar deneyin")
      setIsCodeVerified(false)
    }
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <button onClick={handleSendCode} type="button" className="flex items-center gap-2 whitespace-nowrap rounded-md bg-cargo-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cargo-green">
          <Send className="h-3.5 w-3.5" />
          {"Do\u011frulama Kodu G\u00f6nder"}
        </button>
        <Input
          placeholder={"Do\u011frulama Kodu"}
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
            type="button"
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
        <p className="mb-3 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" />{"Kod ba\u015far\u0131yla do\u011fruland\u0131"}
        </p>
      )}
      {codeError && (
        <p className="mb-3 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />{codeError}</p>
      )}
      {phoneError && (
        <p className="mb-2 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />{phoneError}</p>
      )}
    </>
  )
}

/* ---- M\u00dc\u015eTER\u0130 EKLE MODAL ---- */
function MusteriEkleModal({ onClose, onSave }: { onClose: () => void; onSave: (c: SavedCustomer) => void }) {
  const [tc, setTc] = useState("")
  const [ad, setAd] = useState("")
  const [soyad, setSoyad] = useState("")
  const [telefon, setTelefon] = useState("")
  const [email, setEmail] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [durum, setDurum] = useState<"aktif" | "pasif">("aktif")

  const handleSave = () => {
    if (!tc || !ad || !soyad || !telefon) {
      alert("L\u00fctfen TC, Ad, Soyad ve Telefon alanlar\u0131n\u0131 doldurun")
      return
    }
    onSave({ tc, ad, soyad, telefon, email: email || undefined, durum })
  }

  return (
    <ModalWrapper onClose={onClose}>
      {(close: () => void) => (
        <>
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">{"M\u00fc\u015fteri Ekle"}</h3>
            <button onClick={close} className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Kapat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                {"M\u00fc\u015fteri Tipi"} <span className="text-destructive">*</span>
              </label>
              <span className="inline-block rounded-md bg-cargo-dark px-5 py-2 text-xs font-medium text-white">{"Ger\u00e7ek Ki\u015fi"}</span>
            </div>
            <div className="mb-3">
              <Input placeholder="T.C. Kimlik No" value={tc} onChange={(e) => setTc(e.target.value.replace(/\D/g, "").slice(0, 11))} className="border-border bg-background" maxLength={11} />
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
              <Input placeholder="E-Posta Adresi" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-border bg-background" />
            </div>
            <PhoneVerification telefon={telefon} phoneError={phoneError} setPhoneError={setPhoneError} />
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Durum</label>
              <select value={durum} onChange={(e) => setDurum(e.target.value as "aktif" | "pasif")} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-cargo-green">
                <option value="aktif">Aktif</option>
                <option value="pasif">Pasif</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <button onClick={close} className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">{"\u0130ptal"}</button>
            <button onClick={() => { handleSave(); close() }} className="rounded-md bg-cargo-green px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-cargo-dark">{"Olu\u015ftur"}</button>
          </div>
        </>
      )}
    </ModalWrapper>
  )
}

/* ---- M\u00dc\u015eTER\u0130 ARA MODAL ---- */
function MusteriAraModal({ onClose, customers }: { onClose: () => void; customers: SavedCustomer[] }) {
  const [searchTc, setSearchTc] = useState("")
  const [searchTel, setSearchTel] = useState("")
  const [results, setResults] = useState<SavedCustomer[]>([])
  const [searched, setSearched] = useState(false)

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
    <ModalWrapper onClose={onClose}>
      {(close: () => void) => (
        <>
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">{"M\u00fc\u015fteri Ara"}</h3>
            <button onClick={close} className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Kapat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <div className="mb-3 flex gap-3">
              <Input placeholder="T.C. Kimlik No" value={searchTc} onChange={(e) => setSearchTc(e.target.value.replace(/\D/g, "").slice(0, 11))} maxLength={11} className="border-border bg-background" />
              <Input placeholder="Telefon" value={searchTel} onChange={(e) => setSearchTel(e.target.value.replace(/\D/g, ""))} className="border-border bg-background" />
            </div>
            <button onClick={handleSearch} className="mb-4 flex w-full items-center justify-center gap-2 rounded-md bg-cargo-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cargo-green">
              <Search className="h-4 w-4" />
              Ara
            </button>
            {searched && results.length === 0 && (
              <div className="rounded-lg border border-border bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">{"M\u00fc\u015fteri bulunamad\u0131."}</div>
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
            <button onClick={close} className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">{"Kapat"}</button>
          </div>
        </>
      )}
    </ModalWrapper>
  )
}

/* ---- M\u00dc\u015eTER\u0130 D\u00dcZENLE MODAL ---- */
function MusteriDuzenleModal({ onClose, customers, onUpdate, onToast }: {
  onClose: () => void
  customers: SavedCustomer[]
  onUpdate: (tc: string, updated: SavedCustomer) => void
  onToast: (msg: string) => void
}) {
  const [searchTc, setSearchTc] = useState("")
  const [searchTel, setSearchTel] = useState("")
  const [foundCustomer, setFoundCustomer] = useState<SavedCustomer | null>(null)
  const [searched, setSearched] = useState(false)

  // Edit fields
  const [editAd, setEditAd] = useState("")
  const [editSoyad, setEditSoyad] = useState("")
  const [editTelefon, setEditTelefon] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editDurum, setEditDurum] = useState<"aktif" | "pasif">("aktif")
  const [phoneError, setPhoneError] = useState("")

  const handleSearch = () => {
    setSearched(true)
    setFoundCustomer(null)
    const found = customers.find((c) => {
      if (searchTc && c.tc === searchTc) return true
      if (searchTel && c.telefon === searchTel) return true
      return false
    })
    if (found) {
      setFoundCustomer(found)
      setEditAd(found.ad)
      setEditSoyad(found.soyad)
      setEditTelefon(found.telefon)
      setEditEmail(found.email || "")
      setEditDurum(found.durum)
    }
  }

  const handleSave = (close: () => void) => {
    if (!foundCustomer) return
    if (!editAd || !editSoyad || !editTelefon) {
      alert("L\u00fctfen Ad, Soyad ve Telefon alanlar\u0131n\u0131 doldurun")
      return
    }
    const cleaned = editTelefon.replace(/\s/g, "")
    if (!/^5\d{9}$/.test(cleaned)) {
      setPhoneError("Ge\u00e7erli bir telefon numaras\u0131 girin")
      return
    }
    const updated: SavedCustomer = {
      tc: foundCustomer.tc,
      ad: editAd,
      soyad: editSoyad,
      telefon: editTelefon,
      email: editEmail || undefined,
      durum: editDurum,
    }
    onUpdate(foundCustomer.tc, updated)
    onToast("M\u00fc\u015fteri bilgileri g\u00fcncellendi")
    close()
  }

  return (
    <ModalWrapper onClose={onClose}>
      {(close: () => void) => (
        <>
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">{"M\u00fc\u015fteri D\u00fczenle"}</h3>
            <button onClick={close} className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Kapat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            {/* Search section */}
            <div className="mb-4">
              <p className="mb-2 text-xs text-muted-foreground">{"TC veya Telefon ile m\u00fc\u015fteri bulun:"}</p>
              <div className="mb-3 flex gap-3">
                <Input placeholder="T.C. Kimlik No" value={searchTc} onChange={(e) => setSearchTc(e.target.value.replace(/\D/g, "").slice(0, 11))} className="border-border bg-background" />
                <Input placeholder="Telefon" value={searchTel} onChange={(e) => setSearchTel(e.target.value.replace(/\D/g, "").slice(0, 10))} className="border-border bg-background" />
              </div>
              <button onClick={handleSearch} className="flex w-full items-center justify-center gap-2 rounded-md bg-cargo-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cargo-green">
                <Search className="h-4 w-4" />
                {"M\u00fc\u015fteri Bul"}
              </button>
            </div>

            {searched && !foundCustomer && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4 text-center text-sm text-destructive">
                {"M\u00fc\u015fteri bulunamad\u0131. TC veya Telefon numaras\u0131n\u0131 kontrol edin."}
              </div>
            )}

            {foundCustomer && (
              <div className="rounded-lg border border-cargo-green/30 bg-cargo-green/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-cargo-green" />
                  <span className="text-sm font-medium text-foreground">{"M\u00fc\u015fteri bulundu: "}{foundCustomer.ad} {foundCustomer.soyad}</span>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">TC: {foundCustomer.tc}</p>

                <div className="mb-3 flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Ad</label>
                    <Input value={editAd} onChange={(e) => setEditAd(e.target.value)} className="border-border bg-background" />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Soyad</label>
                    <Input value={editSoyad} onChange={(e) => setEditSoyad(e.target.value)} className="border-border bg-background" />
                  </div>
                </div>
                <div className="mb-3 flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Telefon</label>
                    <Input
                      value={editTelefon}
                      onChange={(e) => { setEditTelefon(e.target.value.replace(/\D/g, "").slice(0, 10)); setPhoneError("") }}
                      className={`border-border bg-background ${phoneError ? "border-destructive" : ""}`}
                      maxLength={10}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">E-Posta</label>
                    <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="border-border bg-background" />
                  </div>
                </div>
                {phoneError && (
                  <p className="mb-2 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />{phoneError}</p>
                )}
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Durum</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditDurum("aktif")}
                      className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-all ${
                        editDurum === "aktif"
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                          : "border-border text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDurum("pasif")}
                      className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-all ${
                        editDurum === "pasif"
                          ? "border-red-500 bg-red-500 text-white shadow-sm"
                          : "border-border text-muted-foreground hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                      }`}
                    >
                      Pasif
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <button onClick={close} className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">{"\u0130ptal"}</button>
            {foundCustomer && (
              <button onClick={() => handleSave(close)} className="rounded-md bg-cargo-green px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-cargo-dark">
                {"G\u00fcncelle"}
              </button>
            )}
          </div>
        </>
      )}
    </ModalWrapper>
  )
}

/* ---- ANA M\u00dc\u015eTER\u0130LER SAYFASI ---- */
export function Musteriler({ customers, onCustomerSaved, onCustomerUpdated, kullaniciSube, onToast }: MusterilerProps) {
  const [showEkle, setShowEkle] = useState(false)
  const [showAra, setShowAra] = useState(false)
  const [showDuzenle, setShowDuzenle] = useState(false)

  const handleSave = (c: SavedCustomer) => {
    onCustomerSaved(c)
    onToast("M\u00fc\u015fteri eklendi")
  }

  const handleUpdate = (tc: string, updated: SavedCustomer) => {
    onCustomerUpdated?.(tc, updated)
  }

  return (
    <div className="p-4">
      <h1 className="mb-6 text-xl font-bold text-foreground">{"M\u00fc\u015fteriler"}</h1>
      <div className="flex flex-wrap gap-4">
        <button onClick={() => setShowAra(true)} className="rounded-lg border border-border bg-card px-10 py-4 text-sm font-medium text-foreground transition-all hover:border-cargo-green hover:shadow-md">
          <Search className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
          {"M\u00fc\u015fteri Ara"}
        </button>
        <button onClick={() => setShowEkle(true)} className="rounded-lg border border-border bg-card px-10 py-4 text-sm font-medium text-foreground transition-all hover:border-cargo-green hover:shadow-md">
          <UserPlus className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
          {"M\u00fc\u015fteri Ekle"}
        </button>
        <button onClick={() => setShowDuzenle(true)} className="rounded-lg border border-border bg-card px-10 py-4 text-sm font-medium text-foreground transition-all hover:border-cargo-green hover:shadow-md">
          <Pencil className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
          {"M\u00fc\u015fteri D\u00fczenle"}
        </button>
      </div>

      {showEkle && <MusteriEkleModal onClose={() => setShowEkle(false)} onSave={handleSave} />}
      {showAra && <MusteriAraModal onClose={() => setShowAra(false)} customers={customers} />}
      {showDuzenle && <MusteriDuzenleModal onClose={() => setShowDuzenle(false)} customers={customers} onUpdate={handleUpdate} onToast={onToast} />}
    </div>
  )
}
