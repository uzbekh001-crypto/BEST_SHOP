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


def make_payload(
    product_type,
    user_id,
    product_id
):
    random_part = secrets.token_hex(8)

    return (
        f"bestshop:"
        f"{product_type}:"
        f"{user_id}:"
        f"{product_id}:"
        f"{random_part}"
    )


async def send_premium_invoice(
    message,
    user_id,
    months: int
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
        months
    )


    create_order(
        user_id=user_id,

        product_type="premium",

        product_name=plan["name"],

        amount=plan["stars"],

        currency="XTR",

        payload=payload
    )


    prices = [
        LabeledPrice(
            label=plan["name"],
            amount=plan["stars"]
        )
    ]


    await message.reply_invoice(

        title=plan["name"],

        description=(
            f"{months} oylik "
            "Telegram Premium xizmati."
        ),

        payload=payload,

        provider_token="",

        currency="XTR",

        prices=prices
    )


async def process_successful_payment(
    update,
    context: ContextTypes.DEFAULT_TYPE
):
    payment = (
        update.message.successful_payment
    )

    if not payment:
        return


    payload = payment.invoice_payload


    order = get_order_by_payload(
        payload
    )


    if not order:
        await update.message.reply_text(
            "⚠️ To‘lov qabul qilindi, "
            "lekin buyurtma topilmadi."
        )

        return


    if order["status"] in (
        "paid",
        "delivered"
    ):
        return


    mark_order_paid(
        payload=payload,

        telegram_charge_id=(
            payment.telegram_payment_charge_id
        )
    )


    try:

        if order["product_type"] != "premium":

            raise ValueError(
                "Noma'lum mahsulot turi."
            )


        parts = payload.split(":")


        if len(parts) < 4:

            raise ValueError(
                "Noto‘g‘ri payment payload."
            )


        months = int(
            parts[3]
        )


        plan = PREMIUM_PLANS.get(
            months
        )


        if not plan:

            raise ValueError(
                "Premium paketi topilmadi."
            )


        await context.bot.gift_premium_subscription(

            user_id=order["user_id"],

            month_count=months,

            star_count=plan["stars"],

            text=(
                "BEST SHOP orqali "
                "Telegram Premium 🎉"
            )
        )


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

            error_message=str(error)
        )


        await update.message.reply_text(

            "⚠️ To‘lov qabul qilindi.\n\n"

            "Xizmatni avtomatik yetkazishda "
            "texnik muammo yuz berdi.\n\n"

            "Buyurtmangiz bazada saqlandi. "
            "Admin tomonidan tekshiriladi."
        )