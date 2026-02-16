"""
Kargo Takip - WhatsApp OTP & Bildirim Botu
==========================================
Bu script ofis bilgisayarinda surekli calisir.
Supabase'deki otp_requests ve whatsapp_messages tablolarini dinler.
Yeni "pending" kayit geldiginde WhatsApp Web uzerinden mesaj atar.

KURULUM:
1. Python 3.8+ yukleyin
2. pip install supabase pywhatkit
3. Bu dosyadaki SUPABASE_URL ve SUPABASE_KEY degerlerini doldurun
4. python bot.py calistirin
5. Ilk calistirmada WhatsApp Web QR kodu okutmaniz gerekecek

NOT: pywhatkit ilk kullanimda tarayici acar ve WhatsApp Web'e baglanir.
     QR kodu telefonunuzdan okutun, sonra bot otomatik mesaj atar.
"""

import time
import datetime
from supabase import create_client, Client

# ===================== AYARLAR =====================
SUPABASE_URL = "BURAYA_SUPABASE_URL_YAZIN"          # ornek: https://xxxxx.supabase.co
SUPABASE_KEY = "BURAYA_SUPABASE_ANON_KEY_YAZIN"     # ornek: eyJhbGci...
KONTROL_ARALIGI = 5  # kac saniyede bir kontrol edilsin
# ===================================================

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def telefon_formatla(numara: str) -> str:
    """Telefon numarasini +90 formatina cevir"""
    temiz = numara.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if temiz.startswith("+90"):
        return temiz
    if temiz.startswith("90"):
        return "+" + temiz
    if temiz.startswith("0"):
        return "+90" + temiz[1:]
    return "+90" + temiz


def whatsapp_mesaj_gonder(telefon: str, mesaj: str) -> bool:
    """pywhatkit ile WhatsApp mesaji gonder"""
    try:
        import pywhatkit as kit
        formatted = telefon_formatla(telefon)
        # Aninda mesaj gonder (15 saniye bekleme, tarayici kapanma suresi 3sn)
        kit.sendwhatmsg_instantly(formatted, mesaj, wait_time=15, tab_close=True, close_time=3)
        print(f"  [OK] Mesaj gonderildi: {formatted}")
        return True
    except Exception as e:
        print(f"  [HATA] Mesaj gonderilemedi {telefon}: {e}")
        return False


def otp_kontrol():
    """Bekleyen OTP isteklerini kontrol et ve WhatsApp'tan kod gonder"""
    try:
        result = supabase.table("otp_requests") \
            .select("*") \
            .eq("status", "pending") \
            .order("created_at", desc=False) \
            .execute()

        for row in result.data:
            telefon = row["phone_number"]
            kod = row["otp_code"]
            row_id = row["id"]

            print(f"[OTP] Yeni dogrulama kodu: {telefon} -> {kod}")

            mesaj = f"*Kargo Takip Dogrulama*\n\nDogrulama kodunuz: *{kod}*\n\nBu kodu 5 dakika icinde girin.\nBu mesaji siz talep etmediyseniz dikkate almayin."

            basarili = whatsapp_mesaj_gonder(telefon, mesaj)

            # Durumu guncelle
            yeni_durum = "sent" if basarili else "failed"
            supabase.table("otp_requests").update({"status": yeni_durum}).eq("id", row_id).execute()

    except Exception as e:
        print(f"[HATA] OTP kontrol hatasi: {e}")


def bildirim_kontrol():
    """Bekleyen WhatsApp bildirimlerini kontrol et ve gonder"""
    try:
        result = supabase.table("whatsapp_messages") \
            .select("*") \
            .eq("status", "pending") \
            .order("created_at", desc=False) \
            .execute()

        for row in result.data:
            telefon = row["phone_number"]
            mesaj = row["message"]
            row_id = row["id"]

            print(f"[BILDIRIM] Yeni mesaj: {telefon}")

            basarili = whatsapp_mesaj_gonder(telefon, mesaj)

            yeni_durum = "sent" if basarili else "failed"
            supabase.table("whatsapp_messages").update({"status": yeni_durum}).eq("id", row_id).execute()

    except Exception as e:
        print(f"[HATA] Bildirim kontrol hatasi: {e}")


def main():
    print("=" * 50)
    print("  KARGO TAKIP - WHATSAPP BOT")
    print("=" * 50)
    print(f"  Supabase: {SUPABASE_URL[:30]}...")
    print(f"  Kontrol araligi: {KONTROL_ARALIGI} saniye")
    print("=" * 50)
    print()
    print("[BASLATILDI] Bot calisiyor, durdurmak icin CTRL+C basin...")
    print()

    while True:
        try:
            simdi = datetime.datetime.now().strftime("%H:%M:%S")

            # OTP isteklerini kontrol et
            otp_kontrol()

            # WhatsApp bildirimlerini kontrol et
            bildirim_kontrol()

            time.sleep(KONTROL_ARALIGI)

        except KeyboardInterrupt:
            print("\n[DURDURULDU] Bot kapatildi.")
            break
        except Exception as e:
            print(f"[HATA] Genel hata: {e}")
            time.sleep(KONTROL_ARALIGI)


if __name__ == "__main__":
    main()
