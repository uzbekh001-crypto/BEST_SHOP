
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routes.orders import router as orders_router
from .routes.products import router as products_router
from .routes.users import router as users_router


# =========================================
# DATABASE
# =========================================

Base.metadata.create_all(bind=engine)


# =========================================
# APP
# =========================================

app = FastAPI(
    title="BEST SHOP API",
    version="1.0.0",
)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================
# API ROUTES
# =========================================

app.include_router(users_router)
app.include_router(products_router)
app.include_router(orders_router)


# =========================================
# BASIC ROUTES
# =========================================

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


# =========================================
# MINI APP
# =========================================

BASE_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = BASE_DIR / "web"


if WEB_DIR.exists():
    app.mount(
        "/app",
        StaticFiles(
            directory=str(WEB_DIR),
            html=True,
        ),
        name="web",
    )

