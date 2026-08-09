import os

from dotenv import load_dotenv
from telegram import (
    Update,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo,
)
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [
            KeyboardButton(
                text="📱 BEST SHOP",
                web_app=WebAppInfo(url=WEBAPP_URL),
            )
        ]
    ]

    reply_markup = ReplyKeyboardMarkup(
        keyboard,
        resize_keyboard=True,
    )

    await update.message.reply_text(
        "👋 Assalomu alaykum!\n\n"
        "BEST SHOP xizmatlaridan foydalanish uchun "
        "quyidagi tugmani bosing 👇",
        reply_markup=reply_markup,
    )


def main():
    if not BOT_TOKEN:
        raise ValueError("BOT_TOKEN .env faylda topilmadi!")

    if not WEBAPP_URL:
        raise ValueError("WEBAPP_URL .env faylda topilmadi!")

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))

    print("BEST SHOP bot ishga tushdi...")

    app.run_polling()


if __name__ == "__main__":
    main()