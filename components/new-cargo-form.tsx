"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Send, UserPlus, Eraser, Check, AlertCircle, Percent, Loader2 } from "lucide-react"
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase"
import type { ConfirmationResult } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CityPicker } from "@/components/city-picker"
import type { Cargo } from "@/lib/cargo-data"

interface NewCargoFormProps {
  onClose: () => void
  onSubmit: (cargo: Cargo) => void
  onCustomerSaved?: (customer: { tc: string; ad: string; soyad: string; telefon: string; email?: string }) => void
  savedCustomers?: Array<{ tc: string; ad: string; soyad: string; telefon: string; email?: string }>
  kullaniciSube?: string
}

type PackageType = "dosya" | "paket" | "koli" | "cuval"

export function NewCargoForm({ onClose, onSubmit, onCustomerSaved, savedCustomers = [], kullaniciSube }: NewCargoFormProps) {
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

  const [smsSending, setSmsSending] = useState(false)
  const [smsVerifying, setSmsVerifying] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  const setupRecaptcha = useCallback(() => {
    if (typeof window === "undefined") return
    if (!(window as Record<string, unknown>).recaptchaVerifier) {
      (window as Record<string, unknown>).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      })
    }
  }, [])

  const handleSendCode = async () => {
    setPhoneError("")
    if (!validatePhone(senderTelefon)) {
      setPhoneError("Ge\u00e7erli bir telefon numaras\u0131 girin (5XX XXX XX XX)")
      return
    }
    setSmsSending(true)
    try {
      setupRecaptcha()
      const appVerifier = (window as Record<string, unknown>).recaptchaVerifier as RecaptchaVerifier
      const phoneNumber = "+90" + senderTelefon.replace(/\s/g, "")
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      setConfirmationResult(result)
      setIsCodeSent(true)
      setCodeError("")
      setSentCode("sent")
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : ""
      if (errorMsg.includes("too-many-requests")) {
        setPhoneError("Çok fazla deneme yaptınız, lütfen bekleyin")
      } else if (errorMsg.includes("invalid-phone-number")) {
        setPhoneError("Geçersiz telefon numarası")
      } else {
        setPhoneError("SMS gönderilemedi, tekrar deneyin")
      }
      // Recaptcha'yi sifirla
      if ((window as Record<string, unknown>).recaptchaVerifier) {
        try {
          (((window as Record<string, unknown>).recaptchaVerifier) as RecaptchaVerifier).clear()
        } catch { /* ignore */ }
        (window as Record<string, unknown>).recaptchaVerifier = undefined
      }
    } finally {
      setSmsSending(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!dogrulamaKodu || dogrulamaKodu.length < 6) {
      setCodeError("6 haneli kodu girin")
      return
    }
    if (!confirmationResult) {
      setCodeError("\u00d6nce kod g\u00f6nderin")
      return
    }
    setSmsVerifying(true)
    try {
      await confirmationResult.confirm(dogrulamaKodu)
      setIsCodeVerified(true)
      setCodeError("")
    } catch {
      setCodeError("Kod hatal\u0131, tekrar deneyin")
      setIsCodeVerified(false)
    } finally {
      setSmsVerifying(false)
    }
  }

  const handleSaveCustomer = () => {
    if (!senderTc || !senderAd || !senderSoyad || !senderTelefon) {
      alert("L\u00fctfen TC, Ad, Soyad ve Telefon alanlar\u0131n\u0131 doldurun")
      return
    }
    if (!validatePhone(senderTelefon)) {
      setPhoneError("Ge\u00e7erli bir telefon numaras\u0131 girin (5XX XXX XX XX)")
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

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmitCargo = () => {
    if (!senderAd || !senderSoyad) {
      alert("G\u00f6nderici Ad ve Soyad alanlar\u0131n\u0131 doldurun")
      return
    }
    if (!senderTelefon || !validatePhone(senderTelefon)) {
      alert("Ge\u00e7erli bir g\u00f6nderici telefon numaras\u0131 girin")
      return
    }
    if (senderEmail && !validateEmail(senderEmail)) {
      alert("Ge\u00e7erli bir e-posta adresi girin (\u00f6rnek: ad@domain.com)")
      return
    }
    if (!isCodeVerified) {
      alert("Kargo eklemeden \u00f6nce do\u011frulama kodunu g\u00f6nderin ve onaylay\u0131n")
      return
    }
    if (!receiverAd) {
      alert("Al\u0131c\u0131 bilgilerini doldurun")
      return
    }
    if (!receiverSube) {
      alert("Alıcı şube / il / ilçe seçimi yapın")
      return
    }

    // Aynı şubeye kargo gönderme kontrolü
    if (kullaniciSube) {
      const selectedLocation = receiverSube.toLowerCase()
      const userBranch = kullaniciSube.toLowerCase()
      if (selectedLocation.includes(userBranch) || userBranch.includes(selectedLocation.split("/").pop()?.trim() || "")) {
        alert(`${kullaniciSube} şubesinden ${kullaniciSube} şubesine kargo gönderilemez!`)
        return
      }
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
      senderTelefon: senderTelefon,
      receiver: `${receiverAd} ${receiverSoyad}`.trim(),
      receiverTelefon: receiverTelefon,
      from: kullaniciSube ? `Kocaeli / ${kullaniciSube}` : "İzmit (Kocaeli) / Gebze",
      fromCity: kullaniciSube || "Gebze",
      to: receiverSube || "Belirtilmedi",
      toCity: receiverSube ? receiverSube.split("/").pop()?.trim() || "" : "",
      amount: toplamTutar,
      departureDate: dateStr,
      departureTime: timeStr,
      arrivalDate: "",
      arrivalTime: "",
      plate: "",
      gonderimTipi: gonderimTipi,
      createdAt: now.toISOString(),
    }

    onSubmit(newCargo)
    handleClose()
  }

  return (
    <>
    <div id="recaptcha-container" />
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
          <h2 className="text-lg font-semibold text-foreground">Yeni Kargo - {kullaniciSube || "Gebze"}</h2>
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
                <h3 className="text-center text-sm font-semibold text-white">Gönderici Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {"Müşteri Tipi"} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-cargo-dark px-4 py-2 text-xs font-medium text-white">Gerçek Kişi</span>
                    <button onClick={handleSaveCustomer} className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-cargo-green hover:bg-cargo-green/5">
                      <UserPlus className="h-3.5 w-3.5" />
                      Müşteri Ekle
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
<button onClick={handleSendCode} disabled={smsSending} className="flex items-center gap-2 whitespace-nowrap rounded-md bg-cargo-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cargo-green disabled:opacity-50">
  {smsSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
  {smsSending ? "G\u00f6nderiliyor..." : "Kod G\u00f6nder"}
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
                    placeholder="Doğrulama Kodu"
                    value={dogrulamaKodu}
                    onChange={(e) => {
                      setDogrulamaKodu(e.target.value.replace(/\D/g, "").slice(0, 6))
                      setCodeError("")
                    }}
                    disabled={!isCodeSent}
                    className={`flex-1 border-border bg-background transition-colors ${
                      isCodeVerified ? "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : ""
                    }`}
                    maxLength={6}
                  />
  <button
  onClick={handleVerifyCode}
  disabled={!isCodeSent || dogrulamaKodu.length < 6 || smsVerifying}
                    className={`flex h-9 w-9 items-center justify-center rounded-md border transition-all ${
                      isCodeVerified
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
                    }`}
                    aria-label="Dogrula"
                  >
                    {smsVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                </div>
                {isCodeVerified && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" />Kod başarıyla doğrulandı
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
                <h3 className="text-center text-sm font-semibold text-white">Alıcı Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {"Müşteri Tipi"} <span className="text-destructive">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-cargo-dark px-4 py-2 text-xs font-medium text-white">Gerçek Kişi</span>
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
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Alıcı Şube / İl / İlçe</label>
                  <CityPicker value={receiverSube} onChange={setReceiverSube} placeholder="İl veya ilçe seçin..." />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Three Sections */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Gonderi Bilgileri */}
            <div className="overflow-hidden rounded-lg border border-cargo-green">
              <div className="bg-cargo-green px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Gönderi Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Gönderim Tipi</label>
                  <Select value={gonderimTipi} onValueChange={setGonderimTipi}>
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ah">Alıcı Haberli</SelectItem>
                      <SelectItem value="gh">Gönderici Haberli</SelectItem>
                      <SelectItem value="agh">Alıcı ve Gönderici Haberli</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">İçerik</label>
                  <Input placeholder="Kargo içeriği" value={icerik} onChange={(e) => setIcerik(e.target.value)} className="border-border bg-background" />
                </div>
              </div>
            </div>

            {/* Gonderi Ozellikleri */}
            <div className="overflow-hidden rounded-lg border border-cargo-teal">
              <div className="bg-cargo-teal px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Gönderi Özellikleri</h3>
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
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Ödeme Tipi</label>
                  <Select value={odemeTipi} onValueChange={setOdemeTipi}>
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pesin">Peşin Ödeme</SelectItem>
                      <SelectItem value="kart">Kartla Ödeme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">İndirim (%)</label>
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
            İptal
          </button>
          <button onClick={handleSubmitCargo} className="rounded-lg bg-cargo-green px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cargo-dark hover:shadow-md active:scale-95">
            Kargo Ekle
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
