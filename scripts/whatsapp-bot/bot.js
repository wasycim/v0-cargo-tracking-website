/**
 * Kargo Takip - WhatsApp Bot (Node.js)
 * =====================================
 * Ofis bilgisayarinda arka planda calisir.
 * Supabase'deki otp_requests ve whatsapp_messages tablolarini dinler.
 * Yeni "pending" kayit geldiginde WhatsApp uzerinden mesaj atar.
 *
 * EKRANDA HICBIR TARAYICI ACILMAZ.
 * QR kodu terminalde gosterir, telefonla okutursun, bitti.
 *
 * KURULUM:
 * 1. Node.js 18+ yukleyin (nodejs.org)
 * 2. Bu klasorde: npm install
 * 3. node bot.js
 * 4. Terminaldeki QR kodu telefondan okutun (WhatsApp > Bagli Cihazlar > Cihaz Bagla)
 * 5. Bir kere okutunca session kaydedilir, sonraki seferlerde otomatik baglanir.
 */

import { createClient } from "@supabase/supabase-js";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";

// ===================== AYARLAR =====================
const SUPABASE_URL = "BURAYA_SUPABASE_URL_YAZIN";
const SUPABASE_KEY = "BURAYA_SUPABASE_ANON_KEY_YAZIN";
const KONTROL_ARALIGI = 5000; // 5 saniye (ms)
// ===================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// WhatsApp client - LocalAuth ile session otomatik kaydedilir
const whatsapp = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--disable-gpu",
    ],
  },
});

let hazir = false;

// ==================== WHATSAPP OLAYLARI ====================

whatsapp.on("qr", (qr) => {
  console.log("");
  console.log("=".repeat(50));
  console.log("  QR KODU ASAGIDA - TELEFONDAN OKUTUN");
  console.log("  WhatsApp > Bagli Cihazlar > Cihaz Bagla");
  console.log("=".repeat(50));
  console.log("");
  qrcode.generate(qr, { small: true });
  console.log("");
});

whatsapp.on("ready", () => {
  hazir = true;
  console.log("");
  console.log("=".repeat(50));
  console.log("  WHATSAPP BAGLANDI!");
  console.log(`  Bot calisiyor (her ${KONTROL_ARALIGI / 1000}sn kontrol)`);
  console.log("  Durdurmak icin CTRL+C basin");
  console.log("=".repeat(50));
  console.log("");

  // Periyodik kontrol baslat
  setInterval(kontrolDongusu, KONTROL_ARALIGI);
  // Ilk kontrolu hemen yap
  kontrolDongusu();
});

whatsapp.on("authenticated", () => {
  console.log("[OK] WhatsApp oturumu dogrulandi (session kaydedildi)");
});

whatsapp.on("auth_failure", (msg) => {
  console.log("[HATA] WhatsApp oturum hatasi:", msg);
  console.log("[BILGI] '.wwebjs_auth' klasorunu silip tekrar deneyin");
});

whatsapp.on("disconnected", (reason) => {
  hazir = false;
  console.log("[UYARI] WhatsApp baglantisi kesildi:", reason);
  console.log("[BILGI] Yeniden baglaniliyor...");
  whatsapp.initialize();
});

// ==================== TELEFON FORMATLAMA ====================

function telefonFormatla(numara) {
  let temiz = numara.replace(/[\s\-\(\)\+]/g, "");
  if (temiz.startsWith("90")) return temiz;
  if (temiz.startsWith("0")) return "90" + temiz.slice(1);
  return "90" + temiz;
}

// ==================== MESAJ GONDERME ====================

async function mesajGonder(telefon, mesaj) {
  try {
    const numara = telefonFormatla(telefon);
    const chatId = numara + "@c.us";

    // Numaranin WhatsApp'ta kayitli olup olmadigini kontrol et
    const kayitli = await whatsapp.isRegisteredUser(chatId);
    if (!kayitli) {
      console.log(`  [UYARI] ${telefon} WhatsApp'ta kayitli degil, mesaj atilamadi`);
      return false;
    }

    await whatsapp.sendMessage(chatId, mesaj);
    console.log(`  [OK] Mesaj gonderildi: +${numara}`);
    return true;
  } catch (e) {
    console.log(`  [HATA] Mesaj gonderilemedi ${telefon}: ${e.message}`);
    return false;
  }
}

// ==================== OTP KONTROL ====================

async function otpKontrol() {
  try {
    const { data, error } = await supabase
      .from("otp_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return;

    for (const row of data) {
      console.log(`[OTP] Dogrulama kodu gonderiliyor: ${row.phone_number} -> ${row.otp_code}`);

      const mesaj =
        `*Kargo Takip Dogrulama*\n\n` +
        `Dogrulama kodunuz: *${row.otp_code}*\n\n` +
        `Bu kodu 5 dakika icinde girin.`;

      const basarili = await mesajGonder(row.phone_number, mesaj);
      const yeniDurum = basarili ? "sent" : "failed";

      await supabase
        .from("otp_requests")
        .update({ status: yeniDurum })
        .eq("id", row.id);
    }
  } catch (e) {
    console.log(`[HATA] OTP kontrol: ${e.message}`);
  }
}

// ==================== BILDIRIM KONTROL ====================

async function bildirimKontrol() {
  try {
    const { data, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return;

    for (const row of data) {
      console.log(`[BILDIRIM] Kargo bildirimi gonderiliyor: ${row.phone_number}`);

      const basarili = await mesajGonder(row.phone_number, row.message);
      const yeniDurum = basarili ? "sent" : "failed";

      await supabase
        .from("whatsapp_messages")
        .update({ status: yeniDurum })
        .eq("id", row.id);
    }
  } catch (e) {
    console.log(`[HATA] Bildirim kontrol: ${e.message}`);
  }
}

// ==================== ANA DONGU ====================

async function kontrolDongusu() {
  if (!hazir) return;
  await otpKontrol();
  await bildirimKontrol();
}

// ==================== BASLATMA ====================

console.log("=".repeat(50));
console.log("  KARGO TAKIP - WHATSAPP BOT");
console.log("=".repeat(50));
console.log("[BASLATILIYOR] WhatsApp baglantisi kuruluyor...");
console.log("[BILGI] Ilk seferde QR kod terminalde gozukecek");
console.log("[BILGI] Telefondan okutun, session otomatik kaydedilir");
console.log("");

whatsapp.initialize();
