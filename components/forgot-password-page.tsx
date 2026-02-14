"use client"

import { useState } from "react"
import { User, Phone, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ForgotPasswordPageProps {
  onBack: () => void
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [tcNo, setTcNo] = useState("")
  const [gsm, setGsm] = useState("")
  const [gsmSon4, setGsmSon4] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleReset = () => {
    setError("")
    setMessage("")

    if (!tcNo || !gsm || !gsmSon4) {
      setError("Lutfen tum alanlari doldurun")
      return
    }
    if (tcNo.length !== 11) {
      setError("TC Kimlik No 11 haneli olmalidir")
      return
    }
    if (gsm.length !== 10) {
      setError("GSM numarasi 10 haneli olmalidir")
      return
    }
    if (gsmSon4.length !== 4) {
      setError("Son 4 rakam giriniz")
      return
    }

    const actualLast4 = gsm.slice(-4)
    if (gsmSon4 !== actualLast4) {
      setError("GSM numarasinin son 4 hanesi uyusmuyor")
      return
    }

    setMessage("Sifre sifirlama bilgileri SMS olarak gonderildi.")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted via-background to-muted p-4">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="px-6 py-5">
            <h1 className="text-center text-lg font-bold text-foreground">Sifre Sifirlama</h1>
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
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="T.C. Kimlik No"
                  value={tcNo}
                  onChange={(e) => setTcNo(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="border-border bg-background pl-10"
                  maxLength={11}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="GSM (5XX XXX XX XX)"
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="border-border bg-background pl-10"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="mb-5">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="GSM Numarasi Son 4 Rakam"
                  value={gsmSon4}
                  onChange={(e) => setGsmSon4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="border-border bg-background pl-10"
                  maxLength={4}
                />
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full rounded-lg bg-cargo-green py-3 text-sm font-bold text-white transition-all hover:bg-cargo-dark active:scale-[0.98]"
            >
              Sifre Sifirla
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={onBack}
                className="flex items-center justify-center gap-1.5 mx-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Giris Sayfasina Geri Don
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
