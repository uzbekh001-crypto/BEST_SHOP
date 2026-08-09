import os

from dotenv import load_dotenv


load_dotenv()


BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()

WEBAPP_URL = os.getenv("WEBAPP_URL", "").strip()

ADMIN_USERNAME = os.getenv(
    "ADMIN_USERNAME",
    "ashurov_pg"
).strip().lstrip("@")


if not BOT_TOKEN:
    raise ValueError(
        "BOT_TOKEN .env faylda topilmadi!"
    )


if not WEBAPP_URL:
    raise ValueError(
        "WEBAPP_URL .env faylda topilmadi!"
    )