from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes.orders import router as orders_router
from .routes.products import router as products_router
from .routes.users import router as users_router


Base.metadata.create_all(
    bind=engine
)


app = FastAPI(
    title="BEST SHOP API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    users_router
)

app.include_router(
    products_router
)

app.include_router(
    orders_router
)


@app.get("/")
def root():

    return {
        "success": True,
        "message": "BEST SHOP API ishlayapti!",
    }


@app.get("/health")
def health():

    return {
        "status": "ok"
    }