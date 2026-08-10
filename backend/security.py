import hashlib
import hmac
import os
from urllib.parse import parse_qsl


def validate_telegram_init_data(
    init_data: str,
) -> dict:

    bot_token = os.getenv("BOT_TOKEN")

    if not bot_token:
        raise ValueError(
            "BOT_TOKEN topilmadi."
        )

    parsed = dict(
        parse_qsl(
            init_data,
            keep_blank_values=True,
        )
    )

    received_hash = parsed.pop(
        "hash",
        None,
    )

    if not received_hash:
        raise ValueError(
            "Telegram hash topilmadi."
        )

    data_check_string = "\n".join(
        f"{key}={value}"
        for key, value in sorted(
            parsed.items()
        )
    )

    secret_key = hmac.new(
        b"WebAppData",
        bot_token.encode(),
        hashlib.sha256,
    ).digest()

    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(
        calculated_hash,
        received_hash,
    ):
        raise ValueError(
            "Telegram initData noto‘g‘ri."
        )

    return parsed