import json

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

    user_raw = data.get("user")

    if not user_raw:
        raise HTTPException(
            status_code=401,
            detail="Telegram user topilmadi.",
        )

    try:
        user = json.loads(user_raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=401,
            detail="User ma'lumoti noto‘g‘ri.",
        )

    return int(user["id"])


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

    db.add(order)
    db.commit()
    db.refresh(order)

    return order


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
            Order.telegram_id == telegram_id
        )
        .order_by(
            Order.id.desc()
        )
        .all()
    )