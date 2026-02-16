/**
 * Kargo Takip - WhatsApp Bot (Node.js)
 * =====================================
 * Her sube kendi bilgisayarinda bu botu calistirir.
 * SUBE_KODU ayari ile sadece o subeye ait mesajlari isler.
 *
 * KURULUM:
 * 1. Node.js 18+ yukleyin (nodejs.org)
 * 2. Bu klasorde: npm install
 * 3. Asagidaki AYARLAR kismini doldurun
 * 4. node bot.js
 * 5. Terminaldeki QR kodu telefondan okutun (WhatsApp > Bagli Cihazlar > Cihaz Bagla)
 * 6. Bir kere okutunca session kaydedilir, sonraki seferlerde otomatik baglanir.
 *
 * ONEMLI: Her subenin SUBE_KODU farkli olmali!
 * Ornek: Ankara subesi -> "ANK", Gebze subesi -> "GBZ"
 * Sube kodu Supabase kullanicilar tablosundaki sube_kodu alani ile ayni olmali.
 */

import { createClient } from "@supabase/supabase-js";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";

// ===================== AYARLAR =====================
const SUPABASE_URL = "BURAYA_SUPABASE_URL_YAZIN";
const SUPABASE_KEY = "BURAYA_SUPABASE_ANON_KEY_YAZIN";
const SUBE_KODU = "BURAYA_SUBE_KODU_YAZIN"; // Ornek: "ANK", "GBZ", "IST"
const KONTROL_ARALIGI = 5000; // 5 saniye (ms)
// ===================================================

if (SUBE_KODU === "BURAYA_SUBE_KODU_YAZIN") {
  console.log("[HATA] Lutfen bot.js dosyasindaki SUBE_KODU degerini doldurun!");
  console.log("[BILGI] Ornek: const SUBE_KODU = \"GBZ\";");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// WhatsApp client - sube koduna gore ayri session klasoru
const whatsapp = new Client({
  authStrategy: new LocalAuth({ clientId: `sube-${SUBE_KODU}` }),
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
  console.log(`  QR KODU - SUBE: ${SUBE_KODU}`);
  console.log("  Telefondan okutun:");
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
  console.log(`  WHATSAPP BAGLANDI! [SUBE: ${SUBE_KODU}]`);
  console.log(`  Sadece "${SUBE_KODU}" subesinin mesajlari islenecek`);
  console.log(`  Bot calisiyor (her ${KONTROL_ARALIGI / 1000}sn kontrol)`);
  console.log("  Durdurmak icin CTRL+C basin");
  console.log("=".repeat(50));
  console.log("");

  setInterval(kontrolDongusu, KONTROL_ARALIGI);
  kontrolDongusu();
});

whatsapp.on("authenticated", () => {
  console.log(`[OK] WhatsApp oturumu dogrulandi [SUBE: ${SUBE_KODU}]`);
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

    const kayitli = await whatsapp.isRegisteredUser(chatId);
    if (!kayitli) {
      console.log(`  [UYARI] ${telefon} WhatsApp'ta kayitli degil`);
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
      .eq("sube_kodu", SUBE_KODU)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return;

    for (const row of data) {
      console.log(`[OTP] [${SUBE_KODU}] Kod gonderiliyor: ${row.phone_number}`);

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
      .eq("sube_kodu", SUBE_KODU)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return;

    for (const row of data) {
      console.log(`[BILDIRIM] [${SUBE_KODU}] Gonderiliyor: ${row.phone_number}`);

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
console.log(`  KARGO TAKIP - WHATSAPP BOT [SUBE: ${SUBE_KODU}]`);
console.log("=".repeat(50));
console.log(`[BILGI] Sube kodu: ${SUBE_KODU}`);
console.log(`[BILGI] Sadece bu subeye ait mesajlar islenecek`);
console.log("[BASLATILIYOR] WhatsApp baglantisi kuruluyor...");
console.log("");

whatsapp.initialize();
