import os
import json
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Bir xil papkadagi modullarni to'g'ri import qilish
try:
    from backend.database import init_db, get_or_create_user, get_all_products
    from backend.auth import verify_telegram_data
except ImportError:
    from database import init_db, get_or_create_user, get_all_products
    from auth import verify_telegram_data

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

app = FastAPI(title="BEST SHOP API")

# Telegram WebApp va lokal testlar uchun CORS ruxsatlarini berish
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Server ishga tushganda ma'lumotlar bazasini yaratish/tekshirish
init_db()

@app.get("/")
def home():
    """Server holatini tekshirish uchun asosiy endpoint."""
    return {"status": "ok", "message": "BEST SHOP API muvaffaqiyatli ishlayapti!"}

@app.post("/api/auth")
def authenticate_user(x_init_data: str = Header(...)):
    """
    Telegram WebApp initData xeshini tekshirish
    va foydalanuvchini bazaga saqlash/qaytish.
    """
    if not BOT_TOKEN:
        raise HTTPException(status_code=500, detail="BOT_TOKEN .env faylda ko'rsatilmagan!")

    validated = verify_telegram_data(x_init_data, BOT_TOKEN)
    if not validated:
        raise HTTPException(status_code=401, detail="Xavfsizlik tekshiruvidan o'tmadi (Soxta so'rov)!")

    user_raw = validated.get("user")
    if not user_raw:
        raise HTTPException(status_code=400, detail="User ma'lumoti topilmadi")

    user_info = json.loads(user_raw)
    db_user = get_or_create_user(
        user_id=user_info["id"],
        first_name=user_info.get("first_name", ""),
        username=user_info.get("username", "")
    )
    return {"status": "success", "user": db_user}

@app.get("/api/products")
def fetch_products():
    """Do'kondagi barcha xizmatlar va tovarlar ro'yxatini olish."""
    products = get_all_products()
    return {"status": "success", "products": products}