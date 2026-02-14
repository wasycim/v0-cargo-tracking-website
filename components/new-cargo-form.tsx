"use client"

import { useState } from "react"
import { X, Send, Truck, UserPlus, Eraser } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface NewCargoFormProps {
  onClose: () => void
  onSubmit: () => void
}

type CustomerType = "gercek" | "tuzel" | "hizmet"
type ReceiverType = "gercek" | "tuzel"
type PackageType = "dosya" | "paket" | "koli" | "cuval"

export function NewCargoForm({ onClose, onSubmit }: NewCargoFormProps) {
  const [senderType, setSenderType] = useState<CustomerType>("gercek")
  const [receiverType, setReceiverType] = useState<ReceiverType>("gercek")
  const [packageType, setPackageType] = useState<PackageType>("dosya")

  const [senderData, setSenderData] = useState({
    tcKimlik: "",
    ad: "",
    soyad: "",
    email: "",
    telefon: "",
    dogrulamaKodu: "",
    atfKullan: false,
  })

  const [receiverData, setReceiverData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    sube: "",
  })

  const [shipmentData, setShipmentData] = useState({
    gonderimTipi: "ah",
    icerik: "",
    desiKg: "0",
    adet: "1",
    degerliKargo: false,
    odemeTipi: "po",
    indirimTutar: "0,00",
    toplamTutar: "200,00",
  })

  const handleSubmit = () => {
    onSubmit()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8">
      <div className="w-full max-w-7xl rounded-lg bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Yeni Kargo - Gebze</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Top Two Sections */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Gonderici Bilgileri */}
            <div className="rounded-lg border border-cargo-green">
              <div className="rounded-t-lg bg-cargo-green px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Gonderici Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="mb-2 block text-xs text-muted-foreground">
                    Musteri Tipi <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSenderType("gercek")}
                      className={`rounded px-4 py-2 text-xs font-medium transition-colors ${
                        senderType === "gercek"
                          ? "bg-cargo-dark text-white"
                          : "border border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      Gercek Kisi
                    </button>
                    <button
                      onClick={() => setSenderType("tuzel")}
                      className={`rounded px-4 py-2 text-xs font-medium transition-colors ${
                        senderType === "tuzel"
                          ? "bg-cargo-dark text-white"
                          : "border border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      Tuzel Kisi
                    </button>
                    <button
                      onClick={() => setSenderType("hizmet")}
                      className={`flex items-center gap-1 rounded px-4 py-2 text-xs font-medium transition-colors ${
                        senderType === "hizmet"
                          ? "bg-cargo-green text-white"
                          : "border border-cargo-green bg-card text-cargo-green hover:bg-emerald-50"
                      }`}
                    >
                      <Truck className="h-3.5 w-3.5" />
                      Hizmet Ici
                    </button>
                    <button className="flex items-center gap-1 rounded border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">
                      <UserPlus className="h-3.5 w-3.5" />
                      Musteri Ekle
                    </button>
                    <button className="flex items-center gap-1 rounded border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">
                      <Eraser className="h-3.5 w-3.5" />
                      Temizle
                    </button>
                  </div>
                </div>

                <div className="mb-3 flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="TC Kimlik No"
                      value={senderData.tcKimlik}
                      onChange={(e) => setSenderData({ ...senderData, tcKimlik: e.target.value })}
                      className="border-border"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 items-center rounded bg-cargo-dark px-4 text-xs font-semibold text-white">
                      TR
                    </span>
                    <span className="text-sm text-muted-foreground">Yabanci Uyruk</span>
                  </div>
                </div>

                <div className="mb-3 flex gap-3">
                  <Input
                    placeholder="Ad"
                    value={senderData.ad}
                    onChange={(e) => setSenderData({ ...senderData, ad: e.target.value })}
                    className="border-border"
                  />
                  <Input
                    placeholder="Soyad"
                    value={senderData.soyad}
                    onChange={(e) => setSenderData({ ...senderData, soyad: e.target.value })}
                    className="border-border"
                  />
                </div>

                <div className="mb-3">
                  <Input
                    placeholder="E-Posta"
                    type="email"
                    value={senderData.email}
                    onChange={(e) => setSenderData({ ...senderData, email: e.target.value })}
                    className="border-border"
                  />
                </div>

                <div className="mb-3 flex gap-3">
                  <Input
                    placeholder="Telefon"
                    value={senderData.telefon}
                    onChange={(e) => setSenderData({ ...senderData, telefon: e.target.value })}
                    className="flex-1 border-border"
                  />
                  <button className="flex items-center gap-2 rounded bg-cargo-dark px-5 py-2 text-sm font-semibold text-white hover:bg-cargo-green transition-colors">
                    <Send className="h-4 w-4" />
                    Kod Gonder
                  </button>
                  <Input
                    placeholder="Dogrulama Kodu"
                    value={senderData.dogrulamaKodu}
                    onChange={(e) =>
                      setSenderData({ ...senderData, dogrulamaKodu: e.target.value })
                    }
                    className="flex-1 border-border"
                  />
                  <button className="flex h-9 w-9 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted">
                    {"✓"}
                  </button>
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={senderData.atfKullan}
                    onCheckedChange={(v) =>
                      setSenderData({ ...senderData, atfKullan: v as boolean })
                    }
                  />
                  ATF Kullan
                </label>
              </div>
            </div>

            {/* Alici Bilgileri */}
            <div className="rounded-lg border border-red-400">
              <div className="rounded-t-lg bg-red-500 px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Alici Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="mb-2 block text-xs text-muted-foreground">
                    Musteri Tipi <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReceiverType("gercek")}
                      className={`rounded px-4 py-2 text-xs font-medium transition-colors ${
                        receiverType === "gercek"
                          ? "bg-cargo-dark text-white"
                          : "border border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      Gercek Kisi
                    </button>
                    <button
                      onClick={() => setReceiverType("tuzel")}
                      className={`rounded px-4 py-2 text-xs font-medium transition-colors ${
                        receiverType === "tuzel"
                          ? "bg-cargo-dark text-white"
                          : "border border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      Tuzel Kisi
                    </button>
                    <button className="flex items-center gap-1 rounded border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">
                      <Eraser className="h-3.5 w-3.5" />
                      Temizle
                    </button>
                  </div>
                </div>

                <div className="mb-3 flex gap-3">
                  <Input
                    placeholder="Ad"
                    value={receiverData.ad}
                    onChange={(e) => setReceiverData({ ...receiverData, ad: e.target.value })}
                    className="border-border"
                  />
                  <Input
                    placeholder="Soyad"
                    value={receiverData.soyad}
                    onChange={(e) => setReceiverData({ ...receiverData, soyad: e.target.value })}
                    className="border-border"
                  />
                </div>

                <div className="mb-3">
                  <Input
                    placeholder="Telefon"
                    value={receiverData.telefon}
                    onChange={(e) => setReceiverData({ ...receiverData, telefon: e.target.value })}
                    className="border-border"
                  />
                </div>

                <div className="mb-3 flex gap-3">
                  <Input
                    placeholder="Alici Sube/Il/Ilce"
                    value={receiverData.sube}
                    onChange={(e) => setReceiverData({ ...receiverData, sube: e.target.value })}
                    className="flex-1 border-border"
                  />
                  <button className="flex h-9 w-9 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted" aria-label="Liste">
                    {"☰"}
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted" aria-label="Saat">
                    {"⏱"}
                  </button>
                </div>

                <button className="w-full rounded bg-cargo-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-cargo-green transition-colors">
                  <div className="flex items-center justify-center gap-2">
                    <Truck className="h-4 w-4" />
                    Kargo Tasima Plani
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Three Sections */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Gonderi Bilgileri */}
            <div className="rounded-lg border border-cargo-green">
              <div className="rounded-t-lg bg-cargo-green px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Gonderi Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <Select
                    value={shipmentData.gonderimTipi}
                    onValueChange={(v) =>
                      setShipmentData({ ...shipmentData, gonderimTipi: v })
                    }
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ah">Alici Haberli - AH</SelectItem>
                      <SelectItem value="gh">Gonderici Haberli - GH</SelectItem>
                      <SelectItem value="kapida">Kapida Odeme</SelectItem>
                    </SelectContent>
                  </Select>
                  <label className="mt-1 block text-xs text-muted-foreground">Gonderim Tipi</label>
                </div>
                <div>
                  <Input
                    placeholder="Icerik"
                    value={shipmentData.icerik}
                    onChange={(e) =>
                      setShipmentData({ ...shipmentData, icerik: e.target.value })
                    }
                    className="border-border"
                  />
                </div>
              </div>
            </div>

            {/* Gonderi Ozellikleri */}
            <div className="rounded-lg border border-cargo-teal">
              <div className="rounded-t-lg bg-cargo-teal px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Gonderi Ozellikleri</h3>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <label className="mb-2 block text-xs text-muted-foreground">
                    Cinsi <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded border border-border overflow-hidden">
                    {(["dosya", "paket", "koli", "cuval"] as PackageType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setPackageType(type)}
                        className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                          packageType === type
                            ? "bg-cargo-dark text-white"
                            : "bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3 flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={shipmentData.desiKg}
                      onChange={(e) =>
                        setShipmentData({ ...shipmentData, desiKg: e.target.value })
                      }
                      className="border-border text-right"
                    />
                    <label className="mt-1 block text-xs text-muted-foreground">Desi/KG</label>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={shipmentData.adet}
                      onChange={(e) =>
                        setShipmentData({ ...shipmentData, adet: e.target.value })
                      }
                      className="border-border text-right"
                    />
                    <label className="mt-1 block text-xs text-muted-foreground">Adet</label>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={shipmentData.degerliKargo}
                    onCheckedChange={(v) =>
                      setShipmentData({
                        ...shipmentData,
                        degerliKargo: v as boolean,
                      })
                    }
                  />
                  Degerli Kargo
                </label>
              </div>
            </div>

            {/* Ucret Bilgileri */}
            <div className="rounded-lg border border-cargo-green">
              <div className="rounded-t-lg bg-cargo-green px-4 py-2.5">
                <h3 className="text-center text-sm font-semibold text-white">Ucret Bilgileri</h3>
              </div>
              <div className="p-4">
                <div className="mb-3 flex gap-3">
                  <div className="flex-1">
                    <Select
                      value={shipmentData.odemeTipi}
                      onValueChange={(v) =>
                        setShipmentData({ ...shipmentData, odemeTipi: v })
                      }
                    >
                      <SelectTrigger className="border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="po">Pesin Odeme - PO(+)</SelectItem>
                        <SelectItem value="go">Gonderici Odeme - GO</SelectItem>
                        <SelectItem value="ao">Alici Odeme - AO</SelectItem>
                      </SelectContent>
                    </Select>
                    <label className="mt-1 block text-xs text-muted-foreground">Odeme Tipi</label>
                  </div>
                  <div className="w-28">
                    <Input
                      value={shipmentData.indirimTutar}
                      onChange={(e) =>
                        setShipmentData({
                          ...shipmentData,
                          indirimTutar: e.target.value,
                        })
                      }
                      className="border-border text-right"
                    />
                    <label className="mt-1 block text-xs text-muted-foreground">Indirim Tutar</label>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded border border-border px-4 py-3">
                  <span className="text-sm text-muted-foreground">Toplam Tutar</span>
                  <span className="text-2xl font-bold text-foreground">{shipmentData.toplamTutar}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
            Iptal
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded bg-cargo-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-cargo-green transition-colors"
          >
            <Truck className="h-4 w-4" />
            Kargo Ekle
          </button>
        </div>
      </div>
    </div>
  )
}
