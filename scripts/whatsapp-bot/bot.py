"""
Kargo Takip - WhatsApp Headless Bot
====================================
Bu script ofis bilgisayarinda arka planda calisir.
Supabase'deki otp_requests ve whatsapp_messages tablolarini dinler.
Yeni "pending" kayit geldiginde WhatsApp Web uzerinden mesaj atar.

EKRANDA HICBIR SEY GORUNMEZ - Tamamen arka planda calisir.

KURULUM:
1. Python 3.8+ yukleyin
2. pip install -r requirements.txt
3. Bu dosyadaki SUPABASE_URL ve SUPABASE_KEY degerlerini doldurun
4. ILK SEFERDE: python bot.py --qr  (QR kodu okutmak icin tarayici acilir)
5. SONRAKI SEFERLER: python bot.py  (tamamen arka planda calisir)
"""

import os
import sys
import time
import json
import datetime
from supabase import create_client, Client
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# ===================== AYARLAR =====================
SUPABASE_URL = "BURAYA_SUPABASE_URL_YAZIN"
SUPABASE_KEY = "BURAYA_SUPABASE_ANON_KEY_YAZIN"
KONTROL_ARALIGI = 5  # saniye
SESSION_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "whatsapp_session")
# ===================================================

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
driver = None


def tarayici_baslat(headless=True):
    """Chrome tarayiciyi baslat (headless = arka plan)"""
    global driver
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(f"--user-data-dir={SESSION_DIR}")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--log-level=3")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.get("https://web.whatsapp.com")
    print("[TARAYICI] WhatsApp Web aciliyor...")


def whatsapp_hazir_mi() -> bool:
    """WhatsApp Web'in yuklenip yuklenmedigini kontrol et"""
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'div[contenteditable="true"][data-tab="3"]'))
        )
        return True
    except:
        return False


def qr_bekle():
    """QR kodu okutulmasini bekle (ilk kurulumda)"""
    print()
    print("=" * 50)
    print("  QR KODU OKUTUN")
    print("  Telefonunuzdan WhatsApp > Bagli Cihazlar")
    print("  > Cihaz Bagla > QR kodu okutun")
    print("=" * 50)
    print()
    print("[BEKLENIYOR] QR kod okutulmasini bekliyorum...")

    for i in range(120):  # 2 dakika bekle
        if whatsapp_hazir_mi():
            print("[TAMAM] WhatsApp Web baglandi!")
            return True
        time.sleep(2)

    print("[HATA] QR kod okutulamadi, sure doldu.")
    return False


def telefon_formatla(numara: str) -> str:
    """Telefon numarasini 905XXXXXXXXX formatina cevir"""
    temiz = numara.replace(" ", "").replace("-", "").replace("(", "").replace(")", "").replace("+", "")
    if temiz.startswith("90"):
        return temiz
    if temiz.startswith("0"):
        return "90" + temiz[1:]
    return "90" + temiz


def mesaj_gonder(telefon: str, mesaj: str) -> bool:
    """WhatsApp Web uzerinden mesaj gonder"""
    try:
        numara = telefon_formatla(telefon)
        url = f"https://web.whatsapp.com/send?phone={numara}&text={mesaj.replace(chr(10), '%0A').replace(' ', '%20')}"
        driver.get(url)

        # Mesaj kutusunun yuklenmesini bekle
        send_box = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'div[contenteditable="true"][data-tab="10"]'))
        )
        time.sleep(1)

        # Enter ile gonder
        send_box.send_keys(Keys.ENTER)
        time.sleep(3)

        print(f"  [OK] Mesaj gonderildi: +{numara}")
        return True
    except Exception as e:
        print(f"  [HATA] Mesaj gonderilemedi {telefon}: {e}")
        return False


def otp_kontrol():
    """Bekleyen OTP isteklerini kontrol et"""
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

            print(f"[OTP] Dogrulama kodu gonderiliyor: {telefon} -> {kod}")

            mesaj = f"*Kargo Takip Dogrulama*\n\nDogrulama kodunuz: *{kod}*\n\nBu kodu 5 dakika icinde girin."

            basarili = mesaj_gonder(telefon, mesaj)
            yeni_durum = "sent" if basarili else "failed"
            supabase.table("otp_requests").update({"status": yeni_durum}).eq("id", row_id).execute()

    except Exception as e:
        print(f"[HATA] OTP kontrol: {e}")


def bildirim_kontrol():
    """Bekleyen WhatsApp bildirimlerini kontrol et"""
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

            print(f"[BILDIRIM] Kargo bildirimi gonderiliyor: {telefon}")

            basarili = mesaj_gonder(telefon, mesaj)
            yeni_durum = "sent" if basarili else "failed"
            supabase.table("whatsapp_messages").update({"status": yeni_durum}).eq("id", row_id).execute()

    except Exception as e:
        print(f"[HATA] Bildirim kontrol: {e}")


def main():
    print("=" * 50)
    print("  KARGO TAKIP - WHATSAPP BOT (HEADLESS)")
    print("=" * 50)

    # Ilk seferde --qr ile calistir, QR okutulunca session kaydedilir
    ilk_kurulum = "--qr" in sys.argv

    if ilk_kurulum:
        print("[KURULUM] Tarayici aciliyor (QR icin)...")
        tarayici_baslat(headless=False)  # QR icin gorunur ac
        if not qr_bekle():
            driver.quit()
            return
        print("[KURULUM] Session kaydedildi. Bundan sonra 'python bot.py' ile arka planda calisir.")
        print("[KURULUM] Simdi botu kapatip 'python bot.py' ile tekrar baslatin.")
        input("Devam etmek icin ENTER basin...")
        driver.quit()
        return

    # Normal calisma - arka planda
    print("[BASLATILIYOR] Arka planda tarayici aciliyor...")
    tarayici_baslat(headless=True)

    # WhatsApp Web yuklenene kadar bekle
    print("[BEKLENIYOR] WhatsApp Web baglantisi kontrol ediliyor...")
    for i in range(60):
        if whatsapp_hazir_mi():
            break
        time.sleep(2)
    else:
        print("[HATA] WhatsApp Web baglanamadi. Once 'python bot.py --qr' ile QR okutun.")
        driver.quit()
        return

    print(f"[HAZIR] Bot calisiyor (her {KONTROL_ARALIGI}sn kontrol)")
    print("[BILGI] Durdurmak icin CTRL+C basin")
    print()

    while True:
        try:
            otp_kontrol()
            bildirim_kontrol()
            time.sleep(KONTROL_ARALIGI)
        except KeyboardInterrupt:
            print("\n[DURDURULDU] Bot kapatiliyor...")
            if driver:
                driver.quit()
            break
        except Exception as e:
            print(f"[HATA] {e}")
            time.sleep(KONTROL_ARALIGI)


if __name__ == "__main__":
    main()
