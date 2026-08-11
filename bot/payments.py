### `bot/payments.py`


import secrets

from telegram import LabeledPrice
from telegram.ext import ContextTypes

from database import (
    create_order,
    get_order_by_payload,
    mark_order_paid,
    mark_order_delivered,
    mark_order_failed,
)


# =========================================
# TELEGRAM PREMIUM PLANLARI
# =========================================

PREMIUM_PLANS = {
    3: {
        "name": "Telegram Premium — 3 oy",
        "stars": 1000,
    },

    6: {
        "name": "Telegram Premium — 6 oy",
        "stars": 1500,
    },

    12: {
        "name": "Telegram Premium — 12 oy",
        "stars": 2500,
    },
}


# =========================================
# PAYMENT PAYLOAD
# =========================================

def make_payload(
    product_type,
    user_id,
    product_id,
):
    random_part = secrets.token_hex(8)

    return (
        f"bestshop:"
        f"{product_type}:"
        f"{user_id}:"
        f"{product_id}:"
        f"{random_part}"
    )


# =========================================
# PREMIUM INVOICE
# =========================================

async def send_premium_invoice(
    message,
    user_id,
    months: int,
):
    plan = PREMIUM_PLANS.get(
        months
    )

    if not plan:
        await message.reply_text(
            "❌ Bu Premium paketi mavjud emas."
        )

        return


    payload = make_payload(
        "premium",
        user_id,
        months,
    )


    # -------------------------------------
    # ORDER YARATISH
    # -------------------------------------

    create_order(
        user_id=user_id,

        product_type="premium",

        product_name=plan["name"],

        amount=plan["stars"],

        currency="XTR",

        payload=payload,
    )


    # -------------------------------------
    # PRICE
    # -------------------------------------

    prices = [
        LabeledPrice(
            label=plan["name"],
            amount=plan["stars"],
        )
    ]


    # -------------------------------------
    # TELEGRAM INVOICE
    # -------------------------------------

    await message.reply_invoice(

        title=plan["name"],

        description=(
            f"{months} oylik "
            "Telegram Premium xizmati."
        ),

        payload=payload,

        provider_token="",

        currency="XTR",

        prices=prices,
    )


# =========================================
# SUCCESSFUL PAYMENT
# =========================================

async def process_successful_payment(
    update,
    context: ContextTypes.DEFAULT_TYPE,
):
    payment = (
        update.message.successful_payment
    )

    if not payment:
        return


    payload = payment.invoice_payload


    # -------------------------------------
    # ORDER TOPISH
    # -------------------------------------

    order = get_order_by_payload(
        payload
    )


    if not order:

        await update.message.reply_text(
            "⚠️ To‘lov qabul qilindi, "
            "lekin buyurtma topilmadi."
        )

        return


    # -------------------------------------
    # DUPLICATE PAYMENT HIMOYASI
    # -------------------------------------

    if order["status"] in (
        "paid",
        "delivered",
    ):
        return


    # -------------------------------------
    # PAYMENT TEKSHIRISH
    # -------------------------------------

    if payment.currency != "XTR":

        mark_order_failed(
            payload=payload,
            error_message=(
                "Noto‘g‘ri payment currency."
            ),
        )

        await update.message.reply_text(
            "⚠️ To‘lov valyutasi noto‘g‘ri."
        )

        return


    # -------------------------------------
    # PAYLOAD TEKSHIRISH
    # -------------------------------------

    parts = payload.split(":")


    if len(parts) != 5:

        mark_order_failed(
            payload=payload,
            error_message=(
                "Noto‘g‘ri payment payload."
            ),
        )

        await update.message.reply_text(
            "⚠️ To‘lov ma'lumotlari noto‘g‘ri."
        )

        return


    if parts[0] != "bestshop":

        mark_order_failed(
            payload=payload,
            error_message=(
                "Noma'lum payment payload."
            ),
        )

        await update.message.reply_text(
            "⚠️ To‘lov ma'lumotlari noto‘g‘ri."
        )

        return


    if parts[1] != "premium":

        mark_order_failed(
            payload=payload,
            error_message=(
                "Noma'lum mahsulot turi."
            ),
        )

        await update.message.reply_text(
            "⚠️ Noma'lum mahsulot."
        )

        return


    # -------------------------------------
    # USER ID
    # -------------------------------------

    try:

        payload_user_id = int(
            parts[2]
        )

    except ValueError:

        mark_order_failed(
            payload=payload,
            error_message=(
                "Payload user ID noto‘g‘ri."
            ),
        )

        await update.message.reply_text(
            "⚠️ To‘lov ma'lumotlari noto‘g‘ri."
        )

        return


    # -------------------------------------
    # PAYMENT USER VA PAYLOAD USER
    # -------------------------------------

    telegram_user_id = (
        update.effective_user.id
    )

    if payload_user_id != telegram_user_id:

        mark_order_failed(
            payload=payload,
            error_message=(
                "Payment user ID mos kelmadi."
            ),
        )

        await update.message.reply_text(
            "⚠️ To‘lov foydalanuvchisi "
            "mos kelmadi."
        )

        return


    # -------------------------------------
    # PREMIUM MONTHS
    # -------------------------------------

    try:

        months = int(
            parts[3]
        )

    except ValueError:

        mark_order_failed(
            payload=payload,
            error_message=(
                "Premium muddati noto‘g‘ri."
            ),
        )

        await update.message.reply_text(
            "⚠️ Premium paketi noto‘g‘ri."
        )

        return


    plan = PREMIUM_PLANS.get(
        months
    )


    if not plan:

        mark_order_failed(
            payload=payload,
            error_message=(
                "Premium paketi topilmadi."
            ),
        )

        await update.message.reply_text(
            "⚠️ Premium paketi topilmadi."
        )

        return


    # -------------------------------------
    # AMOUNT TEKSHIRISH
    # -------------------------------------

    if payment.total_amount != plan["stars"]:

        mark_order_failed(
            payload=payload,
            error_message=(
                "Payment amount mos kelmadi."
            ),
        )

        await update.message.reply_text(
            "⚠️ To‘lov summasi mos kelmadi."
        )

        return


    # -------------------------------------
    # ORDERNI PAID QILISH
    # -------------------------------------

    mark_order_paid(
        payload=payload,

        telegram_charge_id=(
            payment.telegram_payment_charge_id
        ),
    )


    # -------------------------------------
    # PREMIUM YETKAZIB BERISH
    # -------------------------------------

    try:

        await context.bot.gift_premium_subscription(

            user_id=payload_user_id,

            month_count=months,

            star_count=plan["stars"],

            text=(
                "BEST SHOP orqali "
                "Telegram Premium 🎉"
            ),
        )


        # ---------------------------------
        # DELIVERED
        # ---------------------------------

        mark_order_delivered(
            payload
        )


        await update.message.reply_text(
            "✅ To‘lov muvaffaqiyatli!\n\n"

            f"💎 {months} oylik "
            "Telegram Premium sizning "
            "akkauntingizga yuborildi."
        )


    except Exception as error:

        mark_order_failed(
            payload=payload,

            error_message=str(error),
        )


        await update.message.reply_text(
            "⚠️ To‘lov qabul qilindi.\n\n"

            "Xizmatni avtomatik yetkazishda "
            "texnik muammo yuz berdi.\n\n"

            "Buyurtmangiz bazada saqlandi. "
            "Admin tomonidan tekshiriladi."
        )

