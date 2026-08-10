import sqlite3

from pathlib import Path
from datetime import datetime, timezone


BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

DATA_DIR.mkdir(
    parents=True,
    exist_ok=True
)

DB_PATH = DATA_DIR / "best_shop.db"


def get_connection():
    connection = sqlite3.connect(
        DB_PATH
    )

    connection.row_factory = sqlite3.Row

    return connection


def init_database():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            product_type TEXT NOT NULL,

            product_name TEXT NOT NULL,

            amount INTEGER NOT NULL,

            currency TEXT NOT NULL,

            payload TEXT NOT NULL UNIQUE,

            status TEXT NOT NULL,

            telegram_charge_id TEXT,

            created_at TEXT NOT NULL,

            paid_at TEXT,

            delivered_at TEXT,

            refunded_at TEXT,

            error_message TEXT
        )
        """
    )

    connection.commit()

    connection.close()


def upsert_user(
    user_id,
    username=None,
    first_name=None,
    last_name=None
):
    now = datetime.now(
        timezone.utc
    ).isoformat()

    connection = get_connection()

    connection.execute(
        """
        INSERT INTO users (
            id,
            username,
            first_name,
            last_name,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)

        ON CONFLICT(id)
        DO UPDATE SET
            username = excluded.username,
            first_name = excluded.first_name,
            last_name = excluded.last_name,
            updated_at = excluded.updated_at
        """,
        (
            user_id,
            username,
            first_name,
            last_name,
            now,
            now
        )
    )

    connection.commit()

    connection.close()


def create_order(
    user_id,
    product_type,
    product_name,
    amount,
    currency,
    payload
):
    now = datetime.now(
        timezone.utc
    ).isoformat()

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO orders (
            user_id,
            product_type,
            product_name,
            amount,
            currency,
            payload,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            product_type,
            product_name,
            amount,
            currency,
            payload,
            "pending",
            now
        )
    )

    order_id = cursor.lastrowid

    connection.commit()

    connection.close()

    return order_id


def get_order_by_payload(payload):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT *
        FROM orders
        WHERE payload = ?
        """,
        (payload,)
    ).fetchone()

    connection.close()

    return row


def mark_order_paid(
    payload,
    telegram_charge_id
):
    now = datetime.now(
        timezone.utc
    ).isoformat()

    connection = get_connection()

    connection.execute(
        """
        UPDATE orders
        SET
            status = 'paid',
            telegram_charge_id = ?,
            paid_at = ?
        WHERE payload = ?
        """,
        (
            telegram_charge_id,
            now,
            payload
        )
    )

    connection.commit()

    connection.close()


def mark_order_delivered(payload):
    now = datetime.now(
        timezone.utc
    ).isoformat()

    connection = get_connection()

    connection.execute(
        """
        UPDATE orders
        SET
            status = 'delivered',
            delivered_at = ?
        WHERE payload = ?
        """,
        (
            now,
            payload
        )
    )

    connection.commit()

    connection.close()


def mark_order_failed(
    payload,
    error_message
):
    connection = get_connection()

    connection.execute(
        """
        UPDATE orders
        SET
            status = 'failed',
            error_message = ?
        WHERE payload = ?
        """,
        (
            str(error_message),
            payload
        )
    )

    connection.commit()

    connection.close()


def get_user_orders(user_id):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT *
        FROM orders
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    ).fetchall()

    connection.close()

    return rows