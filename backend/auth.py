import hmac
import hashlib
from urllib.parse import parse_qsl, unquote

def verify_telegram_data(init_data: str, bot_token: str) -> dict | None:
    """Telegram WebApp initData xeshini tekshiradi."""
    try:
        parsed_data = dict(parse_qsl(init_data))
        if "hash" not in parsed_data:
            return None

        data_hash = parsed_data.pop("hash")
        
        # Kalitlarni alfabit bo'yicha saralash
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))

        # HMAC-SHA256 yordamida kalit yaratish
        secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if calculated_hash == data_hash:
            return parsed_data
        return None
    except Exception:
        return None