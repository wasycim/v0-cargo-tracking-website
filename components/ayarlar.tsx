"use client"

import { useState } from "react"
import { Printer, Save, TestTube, Usb, Wifi, Check } from "lucide-react"
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
}

export function Ayarlar({ onToast }: AyarlarProps) {
  const [printerModel, setPrinterModel] = useState("zebra-gk420d")
  const [printerPort, setPrinterPort] = useState("USB001")
  const [printerIp, setPrinterIp] = useState("")
  const [connectionType, setConnectionType] = useState("usb")
  const [barcodeWidth, setBarcodeWidth] = useState("60")
  const [barcodeHeight, setBarcodeHeight] = useState("40")
  const [printSpeed, setPrintSpeed] = useState("orta")
  const [printDensity, setPrintDensity] = useState("orta")
  const [autoPrint, setAutoPrint] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    onToast?.("Ayarlar kaydedildi")
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTestPrint = () => {
    onToast?.("Test barkodu yazdiriliyor")
    const printWindow = window.open("", "_blank", "width=400,height=250")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Test Barkod</title>
            <style>
              body { font-family: monospace; text-align: center; padding: 20px; }
              .title { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
              .barcode { font-size: 36px; letter-spacing: 3px; font-weight: bold; margin: 15px 0; }
              .lines { display: flex; justify-content: center; gap: 2px; margin: 10px 0; }
              .lines span { display: block; background: #000; height: 50px; }
              .info { font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="title">TEST BARKOD</div>
            <div class="barcode">000 000 000</div>
            <div class="lines">
              ${Array.from({ length: 30 }).map((_, i) => `<span style="width:${(i % 3) + 1}px"></span><span style="width:1px;background:#fff"></span>`).join("")}
            </div>
            <div class="info">Yazici: ${printerModel}</div>
            <div class="info">Baglanti: ${connectionType === "usb" ? `USB - ${printerPort}` : `Ag - ${printerIp}`}</div>
            <div class="info">Boyut: ${barcodeWidth}mm x ${barcodeHeight}mm</div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Ayarlar</h1>

      {/* Yazici Ayarlari */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-cargo-green px-5 py-3">
          <Printer className="h-5 w-5 text-white" />
          <h2 className="text-sm font-semibold text-white">Yazici Ayarlari</h2>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Yazici Modeli</label>
            <Select value={printerModel} onValueChange={setPrinterModel}>
              <SelectTrigger className="border-border bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zebra-gk420d">Zebra GK420d</SelectItem>
                <SelectItem value="zebra-zd220">Zebra ZD220</SelectItem>
                <SelectItem value="zebra-zd421">Zebra ZD421</SelectItem>
                <SelectItem value="zebra-zt230">Zebra ZT230</SelectItem>
                <SelectItem value="tsc-te200">TSC TE200</SelectItem>
                <SelectItem value="tsc-te210">TSC TE210</SelectItem>
                <SelectItem value="tsc-ta210">TSC TA210</SelectItem>
                <SelectItem value="honeywell-pc42t">Honeywell PC42t</SelectItem>
                <SelectItem value="honeywell-pc43t">Honeywell PC43t</SelectItem>
                <SelectItem value="brother-ql820">Brother QL-820NWB</SelectItem>
                <SelectItem value="dymo-450">Dymo LabelWriter 450</SelectItem>
                <SelectItem value="diger">Diger</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Connection Type */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Baglanti Tipi</label>
            <div className="flex gap-2">
              <button
                onClick={() => setConnectionType("usb")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  connectionType === "usb"
                    ? "border-cargo-green bg-cargo-green text-white"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                <Usb className="h-4 w-4" />
                USB
              </button>
              <button
                onClick={() => setConnectionType("network")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  connectionType === "network"
                    ? "border-cargo-green bg-cargo-green text-white"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                <Wifi className="h-4 w-4" />
                Ag (IP)
              </button>
            </div>
          </div>

          {connectionType === "usb" ? (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">USB Port</label>
              <Select value={printerPort} onValueChange={setPrinterPort}>
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USB001">USB001</SelectItem>
                  <SelectItem value="USB002">USB002</SelectItem>
                  <SelectItem value="USB003">USB003</SelectItem>
                  <SelectItem value="COM1">COM1</SelectItem>
                  <SelectItem value="COM2">COM2</SelectItem>
                  <SelectItem value="COM3">COM3</SelectItem>
                  <SelectItem value="LPT1">LPT1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Yazici IP Adresi</label>
              <Input
                placeholder="192.168.1.100"
                value={printerIp}
                onChange={(e) => setPrinterIp(e.target.value)}
                className="border-border bg-background"
              />
            </div>
          )}
        </div>
      </div>

      {/* Barkod Ayarlari */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-cargo-teal px-5 py-3">
          <Printer className="h-5 w-5 text-white" />
          <h2 className="text-sm font-semibold text-white">Barkod Ayarlari</h2>
        </div>
        <div className="p-5">
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Barkod Genisligi (mm)</label>
              <Input type="number" min={20} max={120} value={barcodeWidth} onChange={(e) => setBarcodeWidth(e.target.value)} className="border-border bg-background" />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Barkod Yuksekligi (mm)</label>
              <Input type="number" min={15} max={80} value={barcodeHeight} onChange={(e) => setBarcodeHeight(e.target.value)} className="border-border bg-background" />
            </div>
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Baski Hizi</label>
              <Select value={printSpeed} onValueChange={setPrintSpeed}>
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yavas">Yavas</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="hizli">Hizli</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Baski Yogunlugu</label>
              <Select value={printDensity} onValueChange={setPrintDensity}>
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dusuk">Dusuk</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="yuksek">Yuksek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoPrint(!autoPrint)}
              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                autoPrint
                  ? "border-cargo-green bg-cargo-green text-white"
                  : "border-border bg-background"
              }`}
            >
              {autoPrint && <Check className="h-3 w-3" />}
            </button>
            <span className="text-sm text-foreground">Kargo eklendikten sonra otomatik barkod yazdir</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleTestPrint}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95"
        >
          <TestTube className="h-4 w-4" />
          Test Barkod Yazdir
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 ${
            saved
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-cargo-green hover:bg-cargo-dark hover:shadow-md"
          }`}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Kaydedildi" : "Kaydet"}
        </button>
      </div>
    </div>
  )
}
