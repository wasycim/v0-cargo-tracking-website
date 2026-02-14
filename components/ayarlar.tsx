"use client"

import { useState, useEffect } from "react"
import { Printer, Save, TestTube, Usb, Wifi, Check, ScanLine, RefreshCw, Building, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AyarlarProps {
  onToast?: (message: string) => void
  kullaniciSube?: string
  onAyarlarSaved?: (ayarlar: { peron_no?: string; sirket_telefon?: string }) => void
}

interface DetectedPort {
  name: string
  vendorId?: string
  productId?: string
}

export function Ayarlar({ onToast, kullaniciSube, onAyarlarSaved }: AyarlarProps) {
  // Şube Bilgileri
  const [peronNo, setPeronNo] = useState("")
  const [sirketTelefon, setSirketTelefon] = useState("")

  // Yazıcı Ayarları
  const [printerModel, setPrinterModel] = useState("zebra-gc420t")
  const [printerPort, setPrinterPort] = useState("USB001")
  const [printerIp, setPrinterIp] = useState("")
  const [connectionType, setConnectionType] = useState("usb")
  const [barcodeWidth, setBarcodeWidth] = useState("100")
  const [barcodeHeight, setBarcodeHeight] = useState("70")
  const [printSpeed, setPrintSpeed] = useState("orta")
  const [printDensity, setPrintDensity] = useState("orta")
  const [autoPrint, setAutoPrint] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [detectedPorts, setDetectedPorts] = useState<DetectedPort[]>([])
  const [scanning, setScanning] = useState(false)

  // Load from DB on mount
  useEffect(() => {
    if (!kullaniciSube) { setLoading(false); return }
    const loadAyarlar = async () => {
      try {
        const res = await fetch(`/api/ayarlar?sube=${encodeURIComponent(kullaniciSube)}`)
        const data = await res.json()
        if (data.ayarlar) {
          const a = data.ayarlar
          setPeronNo(a.peron_no || "")
          setSirketTelefon(a.sirket_telefon || "")
          setPrinterModel(a.yazici_model || "zebra-gc420t")
          setPrinterPort(a.yazici_port || "USB001")
          setPrinterIp(a.yazici_ip || "")
          setConnectionType(a.baglanti_tipi || "usb")
          setBarcodeWidth(a.barkod_genislik || "100")
          setBarcodeHeight(a.barkod_yukseklik || "70")
          setPrintSpeed(a.baski_hiz || "orta")
          setPrintDensity(a.baski_yogunluk || "orta")
          setAutoPrint(a.otomatik_barkod || false)
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    loadAyarlar()
  }, [kullaniciSube])

  const handleScanPorts = async () => {
    setScanning(true)
    try {
      if ("serial" in navigator) {
        // @ts-expect-error Web Serial API
        const ports = await navigator.serial.getPorts()
        const portList: DetectedPort[] = ports.map((p: { getInfo: () => { usbVendorId?: number; usbProductId?: number } }, i: number) => {
          const info = p.getInfo()
          return { name: `COM${i + 1}`, vendorId: info.usbVendorId?.toString(16), productId: info.usbProductId?.toString(16) }
        })
        if (portList.length === 0) {
          try {
            // @ts-expect-error Web Serial API
            const port = await navigator.serial.requestPort()
            const info = port.getInfo()
            portList.push({ name: "COM1", vendorId: info.usbVendorId?.toString(16), productId: info.usbProductId?.toString(16) })
          } catch { /* cancelled */ }
        }
        setDetectedPorts(portList)
        onToast?.(portList.length > 0 ? `${portList.length} port bulundu` : "Bağlı port bulunamadı")
      } else {
        setDetectedPorts([{ name: "USB001" }, { name: "USB002" }, { name: "COM1" }, { name: "COM2" }, { name: "LPT1" }])
        onToast?.("Tarayıcı port erişimini desteklemiyor, varsayılan portlar listelendi")
      }
    } catch { onToast?.("Port tarama başarısız oldu") }
    finally { setScanning(false) }
  }

  const handleSave = async () => {
    try {
      const res = await fetch("/api/ayarlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sube: kullaniciSube,
          peron_no: peronNo,
          sirket_telefon: sirketTelefon,
          yazici_model: printerModel,
          yazici_port: printerPort,
          yazici_ip: printerIp,
          baglanti_tipi: connectionType,
          barkod_genislik: barcodeWidth,
          barkod_yukseklik: barcodeHeight,
          baski_hiz: printSpeed,
          baski_yogunluk: printDensity,
          otomatik_barkod: autoPrint,
        }),
      })
      if (res.ok) {
        setSaved(true)
        onToast?.("Ayarlar veritabanına kaydedildi")
        onAyarlarSaved?.({ peron_no: peronNo, sirket_telefon: sirketTelefon })
        setTimeout(() => setSaved(false), 2000)
      } else {
        onToast?.("Kaydetme başarısız oldu")
      }
    } catch {
      onToast?.("Bağlantı hatası")
    }
  }

  const handleTestPrint = () => {
    onToast?.("Test barkodu yazdırılıyor")
    const footerText = `${kullaniciSube || "Şube"}${peronNo ? ` / Peron ${peronNo}` : ""}${sirketTelefon ? ` / ${sirketTelefon}` : ""}`
    const printWindow = window.open("", "_blank", "width=500,height=400")
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Test Barkod</title>
<style>
  @page { margin: 2mm; size: ${barcodeWidth}mm ${barcodeHeight}mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; width: ${barcodeWidth}mm; padding: 3mm; }
  .header { display: flex; justify-content: space-between; margin-bottom: 2mm; }
  .dest-city { font-size: 22pt; font-weight: bold; }
  .from-city { font-size: 11pt; }
  .tracking { font-size: 14pt; font-weight: bold; text-align: right; }
  .hat { font-size: 11pt; font-weight: bold; margin-bottom: 2mm; }
  .info-table { width: 100%; border-collapse: collapse; font-size: 8pt; }
  .info-table td { border: 0.5px solid #000; padding: 1.5mm 2mm; }
  .info-table .section-header { text-align: center; font-weight: bold; background: #f0f0f0; }
  .footer { font-size: 7pt; text-align: center; margin-top: 2mm; }
</style></head>
<body>
  <div class="header"><div><div class="dest-city">TEST ŞEHİR</div><div class="from-city">${kullaniciSube || "GEBZE"}</div></div>
  <div><div style="font-size:10pt;font-weight:bold;text-align:right">AH PÖ</div><div class="tracking">000 000 000</div></div></div>
  <div class="hat">TEST HATTI</div>
  <table class="info-table">
    <tr><td colspan="2" class="section-header">GÖNDERİCİ BİLGİLERİ</td><td style="font-weight:bold">Tarih</td><td>${new Date().toLocaleDateString("tr-TR")}</td></tr>
    <tr><td colspan="2" rowspan="3">Test Gönderici<br>(***) *** 00 00<br>Kocaeli / Gebze</td><td style="font-weight:bold">Türü</td><td>Paket</td></tr>
    <tr><td style="font-weight:bold">KG/DS</td><td>-</td></tr>
    <tr><td style="font-weight:bold">Adet</td><td>1/1</td></tr>
    <tr><td colspan="4" class="section-header">ALICI BİLGİLERİ</td></tr>
    <tr><td colspan="4">Test Alıcı<br>(***) *** 00 00<br>Test İl / Test İlçe</td></tr>
  </table>
  <div class="footer">${footerText}</div>
  <script>window.onload = function() { window.print(); }<\/script>
</body></html>`)
      printWindow.document.close()
    }
  }

  const printerModels = [
    { value: "zebra-gc420t", label: "Zebra GC420t" },
    { value: "zebra-gk420d", label: "Zebra GK420d" },
    { value: "zebra-zd220", label: "Zebra ZD220" },
    { value: "zebra-zd421", label: "Zebra ZD421" },
    { value: "zebra-zt230", label: "Zebra ZT230" },
    { value: "tsc-te200", label: "TSC TE200" },
    { value: "tsc-te210", label: "TSC TE210" },
    { value: "tsc-ta210", label: "TSC TA210" },
    { value: "honeywell-pc42t", label: "Honeywell PC42t" },
    { value: "honeywell-pc43t", label: "Honeywell PC43t" },
    { value: "brother-ql820", label: "Brother QL-820NWB" },
    { value: "dymo-450", label: "Dymo LabelWriter 450" },
    { value: "diger", label: "Diğer" },
  ]

  const defaultPorts = [{ name: "USB001" }, { name: "USB002" }, { name: "USB003" }, { name: "COM1" }, { name: "COM2" }, { name: "COM3" }, { name: "LPT1" }]
  const portList = detectedPorts.length > 0 ? detectedPorts : defaultPorts

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Ayarlar yükleniyor...</div>
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Ayarlar</h1>

      {/* Şube Bilgileri */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-cargo-dark px-5 py-3">
          <Building className="h-5 w-5 text-white" />
          <h2 className="text-sm font-semibold text-white">Şube Bilgileri</h2>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şube Adı</label>
            <Input value={kullaniciSube || ""} disabled className="border-border bg-muted/50" />
          </div>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Peron Numarası</label>
              <Input
                placeholder="Örn: 5/A"
                value={peronNo}
                onChange={(e) => setPeronNo(e.target.value)}
                className="border-border bg-background"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Phone className="h-3 w-3" />
                Şirket Telefon Numarası
              </label>
              <Input
                placeholder="Örn: 0507 533 41 93"
                value={sirketTelefon}
                onChange={(e) => setSirketTelefon(e.target.value)}
                className="border-border bg-background"
              />
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Barkod alt yazısı önizleme:</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {kullaniciSube || "Şube"}{peronNo ? ` / Peron ${peronNo}` : ""}{sirketTelefon ? ` / ${sirketTelefon}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Yazıcı Ayarları */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-cargo-green px-5 py-3">
          <Printer className="h-5 w-5 text-white" />
          <h2 className="text-sm font-semibold text-white">Yazıcı Ayarları</h2>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Yazıcı Modeli</label>
            <Select value={printerModel} onValueChange={setPrinterModel}>
              <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {printerModels.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bağlantı Tipi</label>
            <div className="flex gap-2">
              <button onClick={() => setConnectionType("usb")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${connectionType === "usb" ? "border-cargo-green bg-cargo-green text-white" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                <Usb className="h-4 w-4" />USB
              </button>
              <button onClick={() => setConnectionType("network")} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${connectionType === "network" ? "border-cargo-green bg-cargo-green text-white" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                <Wifi className="h-4 w-4" />Ağ (IP)
              </button>
            </div>
          </div>
          {connectionType === "usb" ? (
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">USB Port</label>
                <button onClick={handleScanPorts} disabled={scanning} className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-cargo-green transition-colors hover:bg-cargo-green/10 disabled:opacity-50">
                  <RefreshCw className={`h-3 w-3 ${scanning ? "animate-spin" : ""}`} />
                  {scanning ? "Taranıyor..." : "Portları Tara"}
                </button>
              </div>
              <Select value={printerPort} onValueChange={setPrinterPort}>
                <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {portList.map((p) => (<SelectItem key={p.name} value={p.name}>{p.name}{p.vendorId && ` (VID:${p.vendorId} PID:${p.productId})`}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Yazıcı IP Adresi</label>
              <Input placeholder="192.168.1.100" value={printerIp} onChange={(e) => setPrinterIp(e.target.value)} className="border-border bg-background" />
            </div>
          )}
        </div>
      </div>

      {/* Barkod Ayarları */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-cargo-teal px-5 py-3">
          <ScanLine className="h-5 w-5 text-white" />
          <h2 className="text-sm font-semibold text-white">Barkod Ayarları</h2>
        </div>
        <div className="p-5">
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Barkod Genişliği (mm)</label>
              <Input type="number" min={20} max={150} value={barcodeWidth} onChange={(e) => setBarcodeWidth(e.target.value)} className="border-border bg-background" />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Barkod Yüksekliği (mm)</label>
              <Input type="number" min={15} max={100} value={barcodeHeight} onChange={(e) => setBarcodeHeight(e.target.value)} className="border-border bg-background" />
            </div>
          </div>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Baskı Hızı</label>
              <Select value={printSpeed} onValueChange={setPrintSpeed}>
                <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yavas">Yavaş</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="hizli">Hızlı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Baskı Yoğunluğu</label>
              <Select value={printDensity} onValueChange={setPrintDensity}>
                <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dusuk">Düşük</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="yuksek">Yüksek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAutoPrint(!autoPrint)} className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${autoPrint ? "border-cargo-green bg-cargo-green text-white" : "border-border bg-background"}`}>
              {autoPrint && <Check className="h-3 w-3" />}
            </button>
            <span className="text-sm text-foreground">Kargo eklendikten sonra otomatik barkod yazdır</span>
          </div>
        </div>
      </div>

      {/* İşlemler */}
      <div className="flex items-center justify-between">
        <button onClick={handleTestPrint} className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95">
          <TestTube className="h-4 w-4" />Test Barkod Yazdır
        </button>
        <button onClick={handleSave} className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 ${saved ? "bg-emerald-500 hover:bg-emerald-600" : "bg-cargo-green hover:bg-cargo-dark hover:shadow-md"}`}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Kaydedildi" : "Kaydet"}
        </button>
      </div>
    </div>
  )
}
