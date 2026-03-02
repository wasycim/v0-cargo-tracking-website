"use client"

import { useState, useEffect } from "react"
import { LogIn, LogOut, Globe, Clock, RefreshCw, User, Calendar } from "lucide-react"

interface UserLog {
  id: string
  kullanici_id: string
  kullanici_ad: string
  kullanici_soyad: string
  sube: string
  islem_tipi: "giris" | "cikis"
  ip_adresi: string | null
  created_at: string
}

interface KullaniciLogProps {
  kullaniciId?: string
  kullaniciAd?: string
  kullaniciSoyad?: string
  kullaniciSube?: string
}

export function KullaniciLog({ kullaniciId, kullaniciAd, kullaniciSoyad, kullaniciSube }: KullaniciLogProps) {
  const [logs, setLogs] = useState<UserLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLogs = async () => {
    if (!kullaniciId) return
    try {
      const res = await fetch(`/api/user-logs?kullanici_id=${encodeURIComponent(kullaniciId)}`)
      const data = await res.json()
      if (data.logs) {
        setLogs(data.logs)
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchLogs()
      setLoading(false)
    }
    load()
  }, [kullaniciId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLogs()
    setRefreshing(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Group logs by date
  const groupedLogs = logs.reduce<Record<string, UserLog[]>>((acc, log) => {
    const date = formatDate(log.created_at)
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        {"Loglar yukleniyor..."}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{"Kullanici Loglari"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {"Giris ve cikis kayitlari ile IP adresleri"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {"Yenile"}
        </button>
      </div>

      {/* User info card */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-cargo-dark px-5 py-3">
          <User className="h-5 w-5 text-white" />
          <h2 className="text-sm font-semibold text-white">{"Kullanici Bilgileri"}</h2>
        </div>
        <div className="flex items-center gap-6 p-5">
          <div>
            <p className="text-xs text-muted-foreground">{"Ad Soyad"}</p>
            <p className="text-sm font-semibold text-foreground">
              {kullaniciAd} {kullaniciSoyad}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{"Sube"}</p>
            <p className="text-sm font-semibold text-foreground">{kullaniciSube}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{"Toplam Kayit"}</p>
            <p className="text-sm font-semibold text-foreground">{logs.length}</p>
          </div>
        </div>
      </div>

      {/* Logs */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <Clock className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">{"Henuz log kaydi bulunamadi"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-5 py-2.5">
                <Calendar className="h-4 w-4 text-cargo-green" />
                <span className="text-sm font-semibold text-foreground">{date}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {dateLogs.length} {"islem"}
                </span>
              </div>
              <div className="divide-y divide-border">
                {dateLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 px-5 py-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        log.islem_tipi === "giris"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {log.islem_tipi === "giris" ? (
                        <LogIn className="h-4 w-4" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {log.islem_tipi === "giris" ? "Giris Yapildi" : "Cikis Yapildi"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            log.islem_tipi === "giris"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {log.islem_tipi === "giris" ? "GIRIS" : "CIKIS"}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(log.created_at)}
                        </span>
                        {log.ip_adresi && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {log.ip_adresi}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
