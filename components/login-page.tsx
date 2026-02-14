"use client"

import { useState } from "react"
import { User, KeyRound, Eye, EyeOff, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

export interface KullaniciInfo {
  id: string
  tc_no: string
  ad: string
  soyad: string
  telefon: string
  sube: string
}

interface LoginPageProps {
  onLogin: (user: KullaniciInfo) => void
  onForgotPassword: () => void
}

export function LoginPage({ onLogin, onForgotPassword }: LoginPageProps) {
  const [tcNo, setTcNo] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!tcNo || !password) {
      setError("Lütfen tüm alanları doldurun")
      return
    }
    if (tcNo.length !== 11) {
      setError("TC Kimlik No 11 haneli olmalıdır")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tc_no: tcNo, sifre: password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Giriş başarısız")
        setLoading(false)
        return
      }

      if (rememberMe) {
        localStorage.setItem("kargo_user", JSON.stringify(data.user))
      }

      onLogin(data.user)
    } catch {
      setError("Bağlantı hatası, tekrar deneyin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted via-background to-muted p-4">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="bg-cargo-green px-6 py-5">
            <h1 className="text-center text-lg font-bold text-white">Kargo Takip Sistemi</h1>
            <p className="text-center text-xs text-white/70">Şube Giriş Paneli</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">T.C. Kimlik No</label>
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
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şifre</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border bg-background pl-10 pr-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin()
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="mb-5 flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-cargo-green"
              />
              <span className="text-xs text-muted-foreground">Beni Hatırla</span>
            </label>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cargo-green py-3 text-sm font-bold text-white transition-all hover:bg-cargo-dark active:scale-[0.98] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Giriş yapılıyor..." : "Oturum Aç"}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={onForgotPassword}
                className="text-sm text-cargo-green transition-colors hover:text-cargo-dark hover:underline"
              >
                Şifremi Unuttum
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
