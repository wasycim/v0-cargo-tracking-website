"use client"

import { useState } from "react"
import { User, Phone, ArrowLeft, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ForgotPasswordPageProps {
  onBack: () => void
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [tcNo, setTcNo] = useState("")
  const [telefon, setTelefon] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setError("")
    setMessage("")

    if (!tcNo || !telefon) {
      setError("L\u00fctfen t\u00fcm alanlar\u0131 doldurun")
      return
    }
    if (tcNo.length !== 11) {
      setError("TC Kimlik No 11 haneli olmal\u0131d\u0131r")
      return
    }
    if (telefon.length < 10) {
      setError("Ge\u00e7erli bir telefon numaras\u0131 girin")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tc_no: tcNo, telefon }),
      })
      const data = await res.json()

      if (data.success) {
        setMessage("\u015eifreniz WhatsApp \u00fczerinden telefonunuza g\u00f6nderildi.")
      } else {
        setError(data.error || "Bir hata olu\u015ftu, tekrar deneyin")
      }
    } catch {
      setError("Sunucu hatas\u0131, tekrar deneyin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted via-background to-muted p-4">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="px-6 py-5">
            <h1 className="text-center text-lg font-bold text-foreground">{"\u015eifre S\u0131f\u0131rlama"}</h1>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {"Bilgilerinizi girin, \u015fifreniz WhatsApp'\u0131n\u0131za g\u00f6nderilecek"}
            </p>
          </div>

          <div className="px-6 pb-6">
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/20">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{message}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-foreground">{"T.C. Kimlik No"}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="XXXXXXXXXXX"
                  value={tcNo}
                  onChange={(e) => setTcNo(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="border-border bg-background pl-10"
                  maxLength={11}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-medium text-foreground">{"Telefon Numaras\u0131"}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="5XX XXX XX XX"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="border-border bg-background pl-10"
                  maxLength={11}
                  onKeyDown={(e) => { if (e.key === "Enter") handleReset() }}
                />
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cargo-green py-3 text-sm font-bold text-white transition-all hover:bg-cargo-dark active:scale-[0.98] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "G\u00f6nderiliyor..." : "WhatsApp ile \u015eifremi G\u00f6nder"}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={onBack}
                className="mx-auto flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {"Giri\u015f Sayfas\u0131na Geri D\u00f6n"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
