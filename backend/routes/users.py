import json

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserResponse
from ..security import validate_telegram_init_data


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


def get_telegram_user(
    x_telegram_init_data: str,
):
    try:
        data = validate_telegram_init_data(
            x_telegram_init_data
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
        return json.loads(user_raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=401,
            detail="Telegram user ma'lumoti noto‘g‘ri.",
        )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    x_telegram_init_data: str = Header(
        ...,
        alias="X-Telegram-Init-Data",
    ),
    db: Session = Depends(get_db),
):

    telegram_user = get_telegram_user(
        x_telegram_init_data
    )

    telegram_id = telegram_user["id"]

    user = (
        db.query(User)
        .filter(
            User.telegram_id == telegram_id
        )
        .first()
    )

    if not user:

        user = User(
            telegram_id=telegram_id,
            first_name=telegram_user.get(
                "first_name",
                "",
            ),
            last_name=telegram_user.get(
                "last_name",
                "",
            ),
            username=telegram_user.get(
                "username",
                "",
            ),
            photo_url=telegram_user.get(
                "photo_url",
                "",
            ),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    else:

        user.first_name = telegram_user.get(
            "first_name",
            "",
        )

        user.last_name = telegram_user.get(
            "last_name",
            "",
        )

        user.username = telegram_user.get(
            "username",
            "",
        )

        user.photo_url = telegram_user.get(
            "photo_url",
            "",
        )

        db.commit()
        db.refresh(user)

    return user