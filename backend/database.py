import sqlite3

DB_NAME = "shop_database.db"

def init_db():
    """Baza va jadval strukturani yaratadi."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Foydalanuvchilar jadvali
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            telegram_id INTEGER PRIMARY KEY,
            first_name TEXT,
            username TEXT,
            balance REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Tovarlar va Xizmatlar
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            category TEXT,
            price REAL,
            description TEXT
        )
    """)

    # Dastlabki tovarlarni joylash (agar bo'sh bo'lsa)
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        products = [
            ("Telegram Premium 1 Oylik", "premium", 45000, "1 oy uchun rasmiy obuna"),
            ("Telegram Premium 12 Oylik", "premium", 380000, "1 Yil uchun rasmiy obuna"),
            ("100 Telegram Stars", "stars", 25000, "In-app xaridlar uchun"),
            ("500 Telegram Stars", "stars", 120000, "In-app xaridlar uchun"),
            ("PUBG Mobile 60 UC", "games", 15000, "Tezkor yetkazib berish"),
            ("PUBG Mobile 325 UC", "games", 68000, "Tezkor yetkazib berish")
        ]
        cursor.executemany("INSERT INTO products (title, category, price, description) VALUES (?, ?, ?, ?)", products)

    conn.commit()
    conn.close()

def get_or_create_user(user_id: int, first_name: str, username: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute("SELECT telegram_id, first_name, username, balance FROM users WHERE telegram_id = ?", (user_id,))
    user = cursor.fetchone()

    if not user:
        cursor.execute("INSERT INTO users (telegram_id, first_name, username) VALUES (?, ?, ?)", 
                       (user_id, first_name, username))
        conn.commit()
        user = (user_id, first_name, username, 0.0)

    conn.close()
    return {
        "telegram_id": user[0],
        "first_name": user[1],
        "username": user[2],
        "balance": user[3]
    }

def get_all_products():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, category, price, description FROM products")
    items = cursor.fetchall()
    conn.close()

    return [{"id": x[0], "title": x[1], "category": x[2], "price": x[3], "description": x[4]} for x in items]