
import json
import os
import secrets
import urllib.parse
import urllib.request

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
)
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, Product
from ..schemas import (
    OrderCreate,
    OrderResponse,
)
from ..security import validate_telegram_init_data


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"],
)


# =========================================
# TELEGRAM BOT
# =========================================

BOT_TOKEN = os.getenv(
    "BOT_TOKEN",
    ""
).strip()


# =========================================
# PREMIUM PLANS
# =========================================
#
# Telegram Stars (XTR) bilan to'lov.
#
# Narxlar bot/payments.py bilan bir xil.
#
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
# TELEGRAM USER ID
# =========================================

def get_user_id(
    init_data: str,
) -> int:

    try:

        data = validate_telegram_init_data(
            init_data
        )

    except ValueError as error:

        raise HTTPException(
            status_code=401,
            detail=str(error),
        )


    user_raw = data.get(
        "user"
    )


    if not user_raw:

        raise HTTPException(
            status_code=401,
            detail="Telegram user topilmadi.",
        )


    try:

        user = json.loads(
            user_raw
        )

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=401,
            detail="User ma'lumoti noto‘g‘ri.",
        )


    try:

        return int(
            user["id"]
        )

    except (
        KeyError,
        TypeError,
        ValueError,
    ):

        raise HTTPException(
            status_code=401,
            detail="Telegram ID noto‘g‘ri.",
        )


# =========================================
# TELEGRAM INVOICE
# =========================================

def create_telegram_invoice(
    user_id: int,
    title: str,
    description: str,
    payload: str,
    amount: int,
):

    if not BOT_TOKEN:

        raise HTTPException(
            status_code=500,
            detail="BOT_TOKEN sozlanmagan.",
        )


    url = (
        f"https://api.telegram.org/"
        f"bot{BOT_TOKEN}/createInvoiceLink"
    )


    data = {
        "title": title,

        "description": description,

        "payload": payload,

        "provider_token": "",

        "currency": "XTR",

        "prices": json.dumps([
            {
                "label": title,
                "amount": amount,
            }
        ]),

        "subscription_period": "",
    }


    encoded = urllib.parse.urlencode(
        data
    ).encode(
        "utf-8"
    )


    request = urllib.request.Request(
        url=url,
        data=encoded,
        method="POST",
        headers={
            "Content-Type":
                "application/x-www-form-urlencoded"
        },
    )


    try:

        with urllib.request.urlopen(
            request,
            timeout=20,
        ) as response:

            raw = response.read().decode(
                "utf-8"
            )


    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=(
                "Telegram invoice yaratishda "
                f"xatolik: {error}"
            ),
        )


    try:

        result = json.loads(
            raw
        )

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=502,
            detail="Telegram javobi noto‘g‘ri.",
        )


    if not result.get("ok"):

        raise HTTPException(
            status_code=502,
            detail=(
                "Telegram invoice yaratmadi: "
                f"{result.get('description', 'Noma’lum xato')}"
            ),
        )


    invoice_link = result.get(
        "result"
    )


    if not invoice_link:

        raise HTTPException(
            status_code=502,
            detail="Invoice link olinmadi.",
        )


    return invoice_link


# =========================================
# CREATE ORDER
# =========================================

@router.post(
    "",
    response_model=OrderResponse,
)
def create_order(
    order_data: OrderCreate,

    x_telegram_init_data: str = Header(
        ...,
        alias="X-Telegram-Init-Data",
    ),

    db: Session = Depends(get_db),
):

    telegram_id = get_user_id(
        x_telegram_init_data
    )


    product = (
        db.query(Product)
        .filter(
            Product.id == order_data.product_id,

            Product.active.is_(True),
        )
        .first()
    )


    if not product:

        raise HTTPException(
            status_code=404,
            detail="Mahsulot topilmadi.",
        )


    order = Order(
        telegram_id=telegram_id,

        product_id=product.id,

        amount=product.price,

        status="pending",
    )


    db.add(
        order
    )

    db.commit()

    db.refresh(
        order
    )


    return order


# =========================================
# PREMIUM INVOICE
# =========================================

@router.post(
    "/premium-invoice",
)
def create_premium_invoice(
    months: int,

    x_telegram_init_data: str = Header(
        ...,
        alias="X-Telegram-Init-Data",
    ),

    db: Session = Depends(get_db),
):

    # -------------------------------------
    # USER
    # -------------------------------------

    telegram_id = get_user_id(
        x_telegram_init_data
    )


    # -------------------------------------
    # PLAN
    # -------------------------------------

    plan = PREMIUM_PLANS.get(
        months
    )


    if not plan:

        raise HTTPException(
            status_code=400,
            detail=(
                "Bu Premium paketi mavjud emas."
            ),
        )


    # -------------------------------------
    # PRODUCT
    # -------------------------------------
    #
    # orders jadvali product_id talab qiladi.
    #
    # Agar Premium product bazada mavjud
    # bo'lsa, shu product ishlatiladi.
    #
    # -------------------------------------

    product = (
        db.query(Product)
        .filter(
            Product.category == "premium",

            Product.active.is_(True),
        )
        .filter(
            Product.duration ==
            f"{months} oy"
        )
        .first()
    )


    # -------------------------------------
    # PRODUCT TOPILMASA
    # -------------------------------------

    if not product:

        product = (
            db.query(Product)
            .filter(
                Product.category ==
                "premium",

                Product.active.is_(True),
            )
            .first()
        )


    if not product:

        raise HTTPException(
            status_code=404,
            detail=(
                "Premium mahsuloti bazada "
                "topilmadi."
            ),
        )


    # -------------------------------------
    # PAYLOAD
    # -------------------------------------

    random_part = secrets.token_hex(
        8
    )


    payload = (
        f"bestshop:"
        f"premium:"
        f"{telegram_id}:"
        f"{months}:"
        f"{random_part}"
    )


    # -------------------------------------
    # LOCAL ORDER
    # -------------------------------------

    order = Order(
        telegram_id=telegram_id,

        product_id=product.id,

        amount=plan["stars"],

        status="pending",

        payment_id=payload,
    )


    db.add(
        order
    )

    db.commit()

    db.refresh(
        order
    )


    # -------------------------------------
    # TELEGRAM INVOICE
    # -------------------------------------

    invoice_link = (
        create_telegram_invoice(
            user_id=telegram_id,

            title=plan["name"],

            description=(
                f"{months} oylik "
                "Telegram Premium."
            ),

            payload=payload,

            amount=plan["stars"],
        )
    )


    return {
        "success": True,

        "order_id": order.id,

        "months": months,

        "stars": plan["stars"],

        "invoice_link": invoice_link,
    }


# =========================================
# GET ORDERS
# =========================================

@router.get(
    "",
    response_model=list[OrderResponse],
)
def get_orders(
    x_telegram_init_data: str = Header(
        ...,
        alias="X-Telegram-Init-Data",
    ),

    db: Session = Depends(get_db),
):

    telegram_id = get_user_id(
        x_telegram_init_data
    )


    return (
        db.query(Order)
        .filter(
            Order.telegram_id ==
            telegram_id
        )
        .order_by(
            Order.id.desc()
        )
        .all()
    )
