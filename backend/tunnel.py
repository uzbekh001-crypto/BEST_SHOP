import ssl
from pyngrok import ngrok, conf

# SSL xatosini aylanib o'tish
ssl._create_default_https_context = ssl._create_unverified_context

# ⚠️ BU YERGA dashboard.ngrok.com dan olgan Authtoken'ingizni qo'ying
NGROK_AUTH_TOKEN = "3Hi2x38ILHdnd3dUlq6y2HDUaSP_6o4iczse8iczYUmyF1tGy"

try:
    # Authtoken'ni sozlash
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    
    print("\nTunnel ulanmoqda, ozgina kuting...")
    
    # 8000-portni internetga chiqarish
    tunnel = ngrok.connect(8000)
    
    print("\n" + "="*55)
    print(f" Sening HTTPS havolang (API_URL): {tunnel.public_url}")
    print("="*55 + "\n")
    print("Shu linkni nusxalab web/app.js dagi API_URL ga qo'ying!\n")
    
    input("Server ishlayapti... To'xtatish uchun ENTER bosing.")
except Exception as e:
    print(f"\nXatolik yuz berdi: {e}")