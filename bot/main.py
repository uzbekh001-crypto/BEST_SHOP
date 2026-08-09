from telegram import (
    Update,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
)

from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    CallbackQueryHandler,
    PreCheckoutQueryHandler,
    MessageHandler,
    filters,
)

from config import (
    BOT_TOKEN,
    WEBAPP_URL,
    ADMIN_USERNAME,
)

from database import (
    init_database,
    upsert_user,
    get_user_orders,
)

from payments import (
    send_premium_invoice,
    process_successful_payment,
)


# =========================================
# START
# =========================================

async def start(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    user = update.effective_user


    if user:

        upsert_user(

            user_id=user.id,

            username=user.username,

            first_name=user.first_name,

            last_name=user.last_name
        )


    keyboard = [

        [

            KeyboardButton(

                text="📱 BEST SHOP",

                web_app=WebAppInfo(
                    url=WEBAPP_URL
                )
            )
        ]
    ]


    reply_markup = ReplyKeyboardMarkup(

        keyboard,

        resize_keyboard=True
    )


    await update.message.reply_text(

        "👋 Assalomu alaykum!\n\n"

        "BEST SHOP xizmatlaridan foydalanish "
        "uchun quyidagi tugmani bosing 👇",

        reply_markup=reply_markup
    )


# =========================================
# PREMIUM MENU
# =========================================

async def premium_menu(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    keyboard = [

        [

            InlineKeyboardButton(

                "💎 3 oy — 1000 ⭐",

                callback_data="premium:3"
            )
        ],

        [

            InlineKeyboardButton(

                "💎 6 oy — 1500 ⭐",

                callback_data="premium:6"
            )
        ],

        [

            InlineKeyboardButton(

                "💎 12 oy — 2500 ⭐",

                callback_data="premium:12"
            )
        ],
    ]


    await update.message.reply_text(

        "💎 Telegram Premium\n\n"

        "Kerakli paketni tanlang:",

        reply_markup=InlineKeyboardMarkup(
            keyboard
        )
    )


# =========================================
# PREMIUM CALLBACK
# =========================================

async def premium_callback(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query


    await query.answer()


    data = query.data


    if not data.startswith(
        "premium:"
    ):

        return


    try:

        months = int(
            data.split(":")[1]
        )

    except (
        ValueError,
        IndexError
    ):

        await query.answer(

            "❌ Noto‘g‘ri paket.",

            show_alert=True
        )

        return


    user = update.effective_user


    if not user:

        await query.answer(

            "❌ Foydalanuvchi aniqlanmadi.",

            show_alert=True
        )

        return


    await send_premium_invoice(

        message=query.message,

        user_id=user.id,

        months=months
    )


# =========================================
# PRE CHECKOUT
# =========================================

async def pre_checkout(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
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
    context: ContextTypes.DEFAULT_TYPE
):

    await process_successful_payment(

        update,

        context
    )


# =========================================
# ORDERS
# =========================================

async def profile_orders(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    user = update.effective_user


    if not user:

        return


    orders = get_user_orders(
        user.id
    )


    if not orders:

        await update.message.reply_text(

            "📦 Hozircha "
            "buyurtmalaringiz yo‘q."
        )

        return


    lines = [

        "📦 <b>Buyurtmalarim</b>",

        ""
    ]


    status_map = {

        "pending":
            "⏳ Kutilmoqda",

        "paid":
            "💰 To‘langan",

        "delivered":
            "✅ Yetkazilgan",

        "failed":
            "⚠️ Muammo",
    }


    for order in orders[:20]:

        status = status_map.get(

            order["status"],

            order["status"]
        )


        lines.append(

            f"#{order['id']} — "
            f"{order['product_name']}"
        )


        lines.append(

            f"{order['amount']} ⭐ — "
            f"{status}"
        )


        lines.append("")


    await update.message.reply_text(

        "\n".join(lines),

        parse_mode="HTML"
    )


# =========================================
# ADMIN
# =========================================

async def admin(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    user = update.effective_user


    if not user:

        return


    username = (
        user.username or ""
    ).lower()


    if username != (
        ADMIN_USERNAME.lower()
    ):

        await update.message.reply_text(

            "❌ Siz admin emassiz."
        )

        return


    await update.message.reply_text(

        "👨‍💻 <b>BEST SHOP Admin</b>\n\n"

        "Admin panel keyingi bosqichda "
        "ulanadi.",

        parse_mode="HTML"
    )


# =========================================
# ERROR HANDLER
# =========================================

async def error_handler(
    update: object,
    context: ContextTypes.DEFAULT_TYPE
):

    print(
        "\n=============================="
    )

    print(
        "BEST SHOP ERROR:"
    )

    print(
        context.error
    )

    print(
        "==============================\n"
    )


# =========================================
# MAIN
# =========================================

def main():

    # Database

    init_database()


    # Application

    application = (

        Application

        .builder()

        .token(BOT_TOKEN)

        .build()
    )


    # /start

    application.add_handler(

        CommandHandler(

            "start",

            start
        )
    )


    # /premium

    application.add_handler(

        CommandHandler(

            "premium",

            premium_menu
        )
    )


    # /orders

    application.add_handler(

        CommandHandler(

            "orders",

            profile_orders
        )
    )


    # /admin

    application.add_handler(

        CommandHandler(

            "admin",

            admin
        )
    )


    # Premium buttons

    application.add_handler(

        CallbackQueryHandler(

            premium_callback,

            pattern=r"^premium:"
        )
    )


    # Payment pre-checkout

    application.add_handler(

        PreCheckoutQueryHandler(

            pre_checkout
        )
    )


    # Successful payment

    application.add_handler(

        MessageHandler(

            filters.SUCCESSFUL_PAYMENT,

            successful_payment
        )
    )


    # Errors

    application.add_error_handler(

        error_handler
    )


    print(
        "BEST SHOP bot ishga tushdi..."
    )


    application.run_polling(

        allowed_updates=Update.ALL_TYPES
    )


# =========================================
# RUN
# =========================================

if __name__ == "__main__":

    main()