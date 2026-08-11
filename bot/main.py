import json
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
    MessageHandler,
    PreCheckoutQueryHandler,
    filters,
)

from payments import (
    send_premium_invoice,
    process_successful_payment,
)


# =========================================
# ENV
# =========================================

load_dotenv()

BOT_TOKEN = os.getenv(
    "BOT_TOKEN",
    ""
).strip()

WEBAPP_URL = os.getenv(
    "WEBAPP_URL",
    ""
).strip()


# =========================================
# START
# =========================================

async def start(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):

    keyboard = [
        [
            KeyboardButton(
                text="📱 BEST SHOP",
                web_app=WebAppInfo(
                    url=WEBAPP_URL
                ),
            )
        ]
    ]

    reply_markup = ReplyKeyboardMarkup(
        keyboard,
        resize_keyboard=True,
    )

    await update.message.reply_text(
        "👋 Assalomu alaykum!\n\n"
        "BEST SHOP xizmatlaridan foydalanish "
        "uchun quyidagi tugmani bosing 👇",
        reply_markup=reply_markup,
    )


# =========================================
# MINI APP DATA
# =========================================

async def web_app_data(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):

    if not update.message:
        return

    if not update.message.web_app_data:
        return

    raw_data = (
        update.message.web_app_data.data
    )

    try:

        data = json.loads(
            raw_data
        )

    except json.JSONDecodeError:

        await update.message.reply_text(
            "❌ So‘rov ma'lumotlari noto‘g‘ri."
        )

        return


    action = data.get(
        "action"
    )


    # =====================================
    # PREMIUM
    # =====================================

    if action == "premium":

        try:

            months = int(
                data.get("months")
            )

        except (
            TypeError,
            ValueError,
        ):

            await update.message.reply_text(
                "❌ Premium muddati noto‘g‘ri."
            )

            return


        if months not in (
            3,
            6,
            12,
        ):

            await update.message.reply_text(
                "❌ Bu Premium paketi mavjud emas."
            )

            return


        user_id = (
            update.effective_user.id
        )


        await send_premium_invoice(
            message=update.message,

            user_id=user_id,

            months=months,
        )

        return


    # =====================================
    # UNKNOWN ACTION
    # =====================================

    await update.message.reply_text(
        "⚠️ Bu amal hozircha mavjud emas."
    )


# =========================================
# PRE-CHECKOUT
# =========================================

async def pre_checkout(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):

    query = update.pre_checkout_query

    await query.answer(
        ok=True
    )


# =========================================
# SUCCESSFUL PAYMENT
# =========================================

async def successful_payment(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
):

    await process_successful_payment(
        update,
        context,
    )


# =========================================
# MAIN
# =========================================

def main():

    if not BOT_TOKEN:

        raise ValueError(
            "BOT_TOKEN .env faylda topilmadi!"
        )

    if not WEBAPP_URL:

        raise ValueError(
            "WEBAPP_URL .env faylda topilmadi!"
        )


    app = (
        Application
        .builder()
        .token(BOT_TOKEN)
        .build()
    )


    # -------------------------------------
    # START
    # -------------------------------------

    app.add_handler(
        CommandHandler(
            "start",
            start,
        )
    )


    # -------------------------------------
    # MINI APP DATA
    # -------------------------------------

    app.add_handler(
        MessageHandler(
            filters.StatusUpdate.WEB_APP_DATA,
            web_app_data,
        )
    )


    # -------------------------------------
    # PRE-CHECKOUT
    # -------------------------------------

    app.add_handler(
        PreCheckoutQueryHandler(
            pre_checkout
        )
    )


    # -------------------------------------
    # SUCCESSFUL PAYMENT
    # -------------------------------------

    app.add_handler(
        MessageHandler(
            filters.SUCCESSFUL_PAYMENT,
            successful_payment,
        )
    )


    print(
        "BEST SHOP bot ishga tushdi..."
    )


    app.run_polling()


# =========================================
# ENTRY POINT
# =========================================

if __name__ == "__main__":
    main()