from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    telegram_id: int
    first_name: str
    last_name: str
    username: str
    photo_url: str
    balance: float
    bonus: float

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    duration: str
    price: float
    active: bool

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    product_id: int


class OrderResponse(BaseModel):
    id: int
    telegram_id: int
    product_id: int
    amount: float
    status: str
    payment_id: str | None
    created_at: datetime

    class Config:
        from_attributes = True