import os
import hmac
import json
import time
import hashlib
from datetime import datetime
from urllib.parse import parse_qsl

import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET", "dev")

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
VALIDATE = os.getenv("TELEGRAM_VALIDATE_INITDATA", "0") == "1"

BITRIX_WEBHOOK_URL = os.getenv("BITRIX_WEBHOOK_URL", "").strip()
MANAGER_CHAT_ID = os.getenv("MANAGER_CHAT_ID", "").strip()
MANAGER_BOT_TOKEN = os.getenv("MANAGER_BOT_TOKEN", "").strip() or BOT_TOKEN


# ---------------------------
# Telegram initData validation
# ---------------------------
def validate_init_data(init_data: str, bot_token: str, max_age_sec: int = 60 * 60) -> bool:
    """
    Validates Telegram WebApp initData (HMAC-SHA256).
    Ref: Telegram Mini Apps docs.
    """
    if not init_data or not bot_token:
        return False

    data = dict(parse_qsl(init_data, keep_blank_values=True))
    hash_received = data.pop("hash", None)
    if not hash_received:
        return False

    # Optional: auth_date freshness
    auth_date = data.get("auth_date")
    try:
        if auth_date:
            if abs(int(time.time()) - int(auth_date)) > max_age_sec:
                return False
    except Exception:
        return False

    # Build data_check_string
    pairs = [f"{k}={v}" for k, v in sorted(data.items(), key=lambda x: x[0])]
    data_check_string = "\n".join(pairs)

    secret_key = hashlib.sha256(bot_token.encode("utf-8")).digest()
    h = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()
    return h == hash_received


def notify_manager(text: str):
    if not (MANAGER_CHAT_ID and MANAGER_BOT_TOKEN):
        return
    try:
        requests.post(
            f"https://api.telegram.org/bot{MANAGER_BOT_TOKEN}/sendMessage",
            json={"chat_id": MANAGER_CHAT_ID, "text": text, "parse_mode": "HTML"},
            timeout=10,
        )
    except Exception:
        pass


def send_to_bitrix(payload: dict):
    """
    Заглушка: формат Bitrix зависит от вашей настройки (CRM webhooks / REST).
    Тут оставляем безопасно: если BITRIX_WEBHOOK_URL пуст — пропускаем.
    """
    if not BITRIX_WEBHOOK_URL:
        return

    # Часто в Bitrix делают входящий вебхук на свою промежуточную точку.
    # Поэтому отправляем payload как JSON.
    try:
        requests.post(BITRIX_WEBHOOK_URL, json=payload, timeout=12)
    except Exception:
        pass


# ---------------------------
# Routes
# ---------------------------
@app.get("/")
def index():
    return render_template("index.html")


@app.get("/health")
def health():
    return jsonify({"ok": True, "ts": datetime.utcnow().isoformat()})


@app.post("/api/lead")
def api_lead():
    body = request.get_json(force=True, silent=True) or {}
    init_data = body.get("initData", "")
    lead = body.get("lead", {})
    analytics = body.get("events", [])

    if VALIDATE:
        if not validate_init_data(init_data, BOT_TOKEN):
            return jsonify({"ok": False, "error": "bad_init_data"}), 403

    # Сохраним минимально (пример: в файл)
    try:
        os.makedirs("data", exist_ok=True)
        with open("data/leads.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps({"lead": lead, "events": analytics, "ts": time.time()}, ensure_ascii=False) + "\n")
    except Exception:
        pass

    # Bitrix/CRM webhook (опционально)
    send_to_bitrix({"lead": lead, "events": analytics})

    # Уведомление менеджеру
    msg = (
        "🧠 <b>Новый лид: AI HR-агентство</b>\n"
        f"• Имя: <b>{lead.get('name','')}</b>\n"
        f"• Телефон: <b>{lead.get('phone','')}</b>\n"
        f"• Компания: <b>{lead.get('company','')}</b>\n"
        f"• Объем найма: <b>{lead.get('hiring_volume','')}</b>\n"
        f"• Тип вакансий: <b>{lead.get('vacancy_types','')}</b>\n"
        f"• Способ связи: <b>{lead.get('contact_method','')}</b>\n"
        f"• Выбор/результат: <b>{lead.get('result','')}</b>\n"
        f"• Комментарий: {lead.get('comment','')}\n"
    )
    notify_manager(msg)

    return jsonify({"ok": True})


if __name__ == "__main__":
    # Для локалки:
    app.run(host="0.0.0.0", port=8000, debug=True)