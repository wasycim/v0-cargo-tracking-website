"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Send, UserPlus, Eraser, Check, AlertCircle, Percent } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Cargo } from "@/lib/cargo-data"

interface NewCargoFormProps {
  onClose: () => void
  onSubmit: (cargo: Cargo) => void
  onCustomerSaved?: (customer: { tc: string; ad: string; soyad: string; telefon: string; email?: string }) => void
  savedCustomers?: Array<{ tc: string; ad: string; soyad: string; telefon: string; email?: string }>
}

type PackageType = "dosya" | "paket" | "koli" | "cuval"

export function NewCargoForm({ onClose, onSubmit, onCustomerSaved, savedCustomers = [] }: NewCargoFormProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [packageType, setPackageType] = useState<PackageType>("dosya")

  // Sender state
  const [senderTc, setSenderTc] = useState("")
  const [senderAd, setSenderAd] = useState("")
  const [senderSoyad, setSenderSoyad] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [senderTelefon, setSenderTelefon] = useState("")
  const [dogrulamaKodu, setDogrulamaKodu] = useState("")
  const [sentCode, setSentCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isCodeVerified, setIsCodeVerified] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [codeError, setCodeError] = useState("")

  // Receiver state
  const [receiverAd, setReceiverAd] = useState("")
  const [receiverSoyad, setReceiverSoyad] = useState("")
  const [receiverTelefon, setReceiverTelefon] = useState("")
  const [receiverSube, setReceiverSube] = useState("")

  // Shipment state
  const [gonderimTipi, setGonderimTipi] = useState("ah")
  const [icerik, setIcerik] = useState("")
  const [fiyat, setFiyat] = useState("100")
  const [adet, setAdet] = useState("1")
  const [odemeTipi, setOdemeTipi] = useState("pesin")
  const [indirimYuzde, setIndirimYuzde] = useState("0")

  // TC auto-fill: when TC reaches 11 digits, check savedCustomers
  useEffect(() => {
    if (senderTc.length === 11 && savedCustomers.length > 0) {
      const found = savedCustomers.find((c) => c.tc === senderTc)
      if (found) {
        setSenderAd(found.ad)
        setSenderSoyad(found.soyad)
        setSenderTelefon(found.telefon)
        if (found.email) setSenderEmail(found.email)
      }
    }
  }, [senderTc, savedCustomers])

  // Animation
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(() => onClose(), 300)
  }, [onClose])

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, "")
    return /^5\d{9}$/.test(cleaned)
  }

  const handleSendCode = () => {
    setPhoneError("")
    if (!validatePhone(senderTelefon)) {
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

  const handleSaveCustomer = () => {
    if (!senderTc || !senderAd || !senderSoyad || !senderTelefon) {
      alert("Lutfen TC, Ad, Soyad ve Telefon alanlarini doldurun")
      return
    }
    if (!validatePhone(senderTelefon)) {
      setPhoneError("Gecerli bir telefon numarasi girin (5XX XXX XX XX)")
      return
    }
    onCustomerSaved?.({
      tc: senderTc,
      ad: senderAd,
      soyad: senderSoyad,
      telefon: senderTelefon,
      email: senderEmail || undefined,
    })
  }

  const handleClearSender = () => {
    setSenderTc("")
    setSenderAd("")
    setSenderSoyad("")
    setSenderEmail("")
    setSenderTelefon("")
    setDogrulamaKodu("")
    setSentCode("")
    setIsCodeSent(false)
    setIsCodeVerified(false)
    setPhoneError("")
    setCodeError("")
  }

  const handleClearReceiver = () => {
    setReceiverAd("")
    setReceiverSoyad("")
    setReceiverTelefon("")
    setReceiverSube("")
  }

  // Calculate total with percentage discount
  const priceNum = Math.max(Number(fiyat) || 0, 100)
  const discountPercent = Math.min(Math.max(Number(indirimYuzde) || 0, 0), 100)
  const discountAmount = (priceNum * discountPercent) / 100
  const toplamTutar = Math.max(priceNum - discountAmount, 0)

  const handleSubmitCargo = () => {
    if (!senderAd || !receiverAd) {
      alert("Gonderici ve Alici bilgilerini doldurun")
      return
    }

    const now = new Date()
    const dateStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })

    const newCargo: Cargo = {
      id: `new-${Date.now()}`,
      status: "yuklenecek",
      trackingNo: `203 ${String(Math.floor(Math.random() * 999)).padStart(3, "0")} ${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      pieces: Number(adet) || 1,
      sender: `${senderAd} ${senderSoyad}`.trim(),
      receiver: `${receiverAd} ${receiverSoyad}`.trim(),
      from: "Izmit (Kocaeli) / Gebze",
      fromCity: "Gebze",
      to: receiverSube || "Belirtilmedi",
      toCity: receiverSube ? receiverSube.split("/").pop()?.trim() || "" : "",
      amount: toplamTutar,
      departureDate: dateStr,
      departureTime: timeStr,
      arrivalDate: "",
      arrivalTime: "",
      plate: "",
      createdAt: now.toISOString(),
    }

    onSubmit(newCargo)
    handleClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 transition-all duration-300 ease-out ${
        isVisible && !isClosing ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className={`w-full max-w-6xl rounded-xl border border-border bg-card shadow-2xl transition-all duration-300 ease-out ${
          isVisible && !isClosing
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Yeni Kargo - Gebze</h2>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label="Kapat">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Top Two Sections */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Gonderici Bilgileri */}
            <div className="overflow-hidden rounded-lg border border-cargo-green">
              <div className="bg-cargo-green px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Gonderici Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {"Musteri Tipi"} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-cargo-dark px-4 py-2 text-xs font-medium text-white">Gercek Kisi</span>
                    <button onClick={handleSaveCustomer} className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-cargo-green hover:bg-cargo-green/5">
                      <UserPlus className="h-3.5 w-3.5" />
                      Musteri Ekle
                    </button>
                    <button onClick={handleClearSender} className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-destructive hover:bg-destructive/5">
                      <Eraser className="h-3.5 w-3.5" />
                      Temizle
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <Input
                    placeholder="TC Kimlik No"
                    value={senderTc}
                    onChange={(e) => setSenderTc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    className="border-border bg-background"
                    maxLength={11}
                  />
                </div>

                <div className="mb-3 flex gap-3">
                  <Input placeholder="Ad" value={senderAd} onChange={(e) => setSenderAd(e.target.value)} className="border-border bg-background" />
                  <Input placeholder="Soyad" value={senderSoyad} onChange={(e) => setSenderSoyad(e.target.value)} className="border-border bg-background" />
                </div>

                <div className="mb-3">
                  <Input placeholder="E-Posta" type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className="border-border bg-background" />
                </div>

                <div className="mb-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="5XX XXX XX XX"
                      value={senderTelefon}
                      onChange={(e) => {
                        setSenderTelefon(e.target.value.replace(/\D/g, "").slice(0, 10))
                        setPhoneError("")
                      }}
                      className={`flex-1 border-border bg-background ${phoneError ? "border-destructive" : ""}`}
                      maxLength={10}
                    />
                    <button onClick={handleSendCode} className="flex items-center gap-2 whitespace-nowrap rounded-md bg-cargo-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cargo-green">
                      <Send className="h-3.5 w-3.5" />
                      Kod Gonder
                    </button>
                  </div>
                  {phoneError && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />{phoneError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Dogrulama Kodu"
                    value={dogrulamaKodu}
                    onChange={(e) => {
                      setDogrulamaKodu(e.target.value.replace(/\D/g, "").slice(0, 4))
                      setCodeError("")
                    }}
                    disabled={!isCodeSent}
                    className={`flex-1 border-border bg-background transition-colors ${
                      isCodeVerified ? "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : ""
                    }`}
                    maxLength={4}
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={!isCodeSent || dogrulamaKodu.length < 4}
                    className={`flex h-9 w-9 items-center justify-center rounded-md border transition-all ${
                      isCodeVerified
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
                    }`}
                    aria-label="Dogrula"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
                {isCodeVerified && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" />Kod basariyla dogrulandi
                  </p>
                )}
                {codeError && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />{codeError}
                  </p>
                )}
              </div>
            </div>

            {/* Alici Bilgileri */}
            <div className="overflow-hidden rounded-lg border border-cargo-teal">
              <div className="bg-cargo-teal px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Alici Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {"Musteri Tipi"} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-cargo-dark px-4 py-2 text-xs font-medium text-white">Gercek Kisi</span>
                    <button onClick={handleClearReceiver} className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-destructive hover:bg-destructive/5">
                      <Eraser className="h-3.5 w-3.5" />
                      Temizle
                    </button>
                  </div>
                </div>

                <div className="mb-3 flex gap-3">
                  <Input placeholder="Ad" value={receiverAd} onChange={(e) => setReceiverAd(e.target.value)} className="border-border bg-background" />
                  <Input placeholder="Soyad" value={receiverSoyad} onChange={(e) => setReceiverSoyad(e.target.value)} className="border-border bg-background" />
                </div>

                <div className="mb-3">
                  <Input placeholder="Telefon (5XX XXX XX XX)" value={receiverTelefon} onChange={(e) => setReceiverTelefon(e.target.value.replace(/\D/g, "").slice(0, 10))} className="border-border bg-background" maxLength={10} />
                </div>

                <div>
                  <Input placeholder="Alici Sube / Il / Ilce" value={receiverSube} onChange={(e) => setReceiverSube(e.target.value)} className="border-border bg-background" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Three Sections */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Gonderi Bilgileri */}
            <div className="overflow-hidden rounded-lg border border-cargo-green">
              <div className="bg-cargo-green px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Gonderi Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Gonderim Tipi</label>
                  <Select value={gonderimTipi} onValueChange={setGonderimTipi}>
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ah">Alici Haberli</SelectItem>
                      <SelectItem value="gh">Gonderici Haberli</SelectItem>
                      <SelectItem value="agh">Alici ve Gonderici Haberli</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Icerik</label>
                  <Input placeholder="Kargo icerigi" value={icerik} onChange={(e) => setIcerik(e.target.value)} className="border-border bg-background" />
                </div>
              </div>
            </div>

            {/* Gonderi Ozellikleri */}
            <div className="overflow-hidden rounded-lg border border-cargo-teal">
              <div className="bg-cargo-teal px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Gonderi Ozellikleri</h3>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {"Cinsi"} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex overflow-hidden rounded-md border border-border">
                    {(["dosya", "paket", "koli", "cuval"] as PackageType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setPackageType(type)}
                        className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                          packageType === type ? "bg-cargo-dark text-white" : "bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Fiyat (TL)</label>
                    <Input
                      type="number"
                      min={100}
                      value={fiyat}
                      onChange={(e) => setFiyat(e.target.value)}
                      onBlur={() => {
                        const val = Number(fiyat)
                        if (val < 100) setFiyat("100")
                      }}
                      className="border-border bg-background text-right"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Adet</label>
                    <Input type="number" min={1} value={adet} onChange={(e) => setAdet(e.target.value)} className="border-border bg-background text-right" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ucret Bilgileri */}
            <div className="overflow-hidden rounded-lg border border-cargo-green">
              <div className="bg-cargo-green px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Ucret Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Odeme Tipi</label>
                  <Select value={odemeTipi} onValueChange={setOdemeTipi}>
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pesin">Pesin Odeme</SelectItem>
                      <SelectItem value="kart">Kartla Odeme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Indirim (%)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={indirimYuzde}
                      onChange={(e) => setIndirimYuzde(e.target.value)}
                      className="border-border bg-background pr-8 text-right"
                    />
                    <Percent className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {discountPercent > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      %{discountPercent} indirim = -{discountAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-border bg-muted/50 p-3 text-right">
                  <span className="text-xs text-muted-foreground">Toplam Tutar</span>
                  <div className="text-2xl font-bold text-foreground">
                    {toplamTutar.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button onClick={handleClose} className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <X className="h-4 w-4" />
            Iptal
          </button>
          <button onClick={handleSubmitCargo} className="rounded-lg bg-cargo-green px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cargo-dark hover:shadow-md active:scale-95">
            Kargo Ekle
          </button>
        </div>
      </div>
    </div>
  )
}
