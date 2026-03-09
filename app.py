import csv
import hashlib
import hmac
import json
import os
import re
import time
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from urllib.parse import parse_qsl

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET", "dev")

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
VALIDATE = os.getenv("TELEGRAM_VALIDATE_INITDATA", "0") == "1"
BITRIX_WEBHOOK_URL = os.getenv("BITRIX_WEBHOOK_URL", "").strip()
MANAGER_CHAT_ID = os.getenv("MANAGER_CHAT_ID", "").strip()
MANAGER_BOT_TOKEN = os.getenv("MANAGER_BOT_TOKEN", "").strip() or BOT_TOKEN
POLICY_URL = os.getenv("POLICY_URL", "https://example.com/privacy")
LEADS_JSONL = DATA_DIR / "leads.jsonl"
LEADS_CSV = DATA_DIR / "leads.csv"

PHONE_RE = re.compile(r"^[+()\-\s\d]{7,20}$")


# ---------------------------
# Telegram initData validation
# ---------------------------
def validate_init_data(init_data: str, bot_token: str, max_age_sec: int = 60 * 60) -> bool:
    if not init_data or not bot_token:
        return False

    data = dict(parse_qsl(init_data, keep_blank_values=True))
    hash_received = data.pop("hash", None)
    if not hash_received:
        return False

    auth_date = data.get("auth_date")
    try:
        if auth_date and abs(int(time.time()) - int(auth_date)) > max_age_sec:
            return False
    except Exception:
        return False

    pairs = [f"{k}={v}" for k, v in sorted(data.items(), key=lambda x: x[0])]
    data_check_string = "\n".join(pairs)
    secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    digest = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, hash_received)


# ---------------------------
# Utils
# ---------------------------
def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def json_response(ok: bool, **kwargs):
    payload = {"ok": ok, **kwargs}
    return jsonify(payload)


def clean_text(value, max_len=500):
    value = "" if value is None else str(value)
    return value.strip()[:max_len]


def sanitize_phone(value: str) -> str:
    value = clean_text(value, 32)
    return value


def get_client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    return forwarded or request.remote_addr or "unknown"


def check_rate_limit(ip: str, ttl_sec: int = 60, max_hits: int = 5) -> bool:
    path = DATA_DIR / "rate_limit.json"
    now = int(time.time())
    data = {}
    try:
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        data = {}

    hits = [ts for ts in data.get(ip, []) if now - ts <= ttl_sec]
    if len(hits) >= max_hits:
        data[ip] = hits
        try:
            path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        except Exception:
            pass
        return False

    hits.append(now)
    data[ip] = hits
    try:
        path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    except Exception:
        pass
    return True


def append_jsonl(record: dict):
    with LEADS_JSONL.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def append_csv(record: dict):
    row = {
        "ts": record.get("ts", ""),
        "name": record.get("lead", {}).get("name", ""),
        "phone": record.get("lead", {}).get("phone", ""),
        "company": record.get("lead", {}).get("company", ""),
        "contact_method": record.get("lead", {}).get("contact_method", ""),
        "hiring_volume": record.get("lead", {}).get("hiring_volume", ""),
        "vacancy_types": record.get("lead", {}).get("vacancy_types", ""),
        "urgency": record.get("lead", {}).get("urgency", ""),
        "budget": record.get("lead", {}).get("budget", ""),
        "result_title": record.get("lead", {}).get("result", {}).get("title", ""),
        "result_format": record.get("lead", {}).get("result", {}).get("format", ""),
        "telegram_id": record.get("lead", {}).get("telegram", {}).get("id", ""),
        "source": record.get("lead", {}).get("source", "Mini App"),
    }
    file_exists = LEADS_CSV.exists()
    with LEADS_CSV.open("a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(row.keys()))
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)


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
    if not BITRIX_WEBHOOK_URL:
        return
    try:
        requests.post(BITRIX_WEBHOOK_URL, json=payload, timeout=12)
    except Exception:
        pass


def validate_lead(lead: dict):
    errors = {}
    name = clean_text(lead.get("name"), 120)
    phone = sanitize_phone(lead.get("phone"))
    company = clean_text(lead.get("company"), 180)
    contact_method = clean_text(lead.get("contact_method"), 50)
    consent = bool(lead.get("consent"))

    if len(name) < 2:
        errors["name"] = "Укажите имя"
    if not PHONE_RE.match(phone):
        errors["phone"] = "Укажите корректный телефон"
    if len(company) < 2:
        errors["company"] = "Укажите компанию"
    if contact_method not in {"telegram", "phone", "whatsapp", "email"}:
        errors["contact_method"] = "Выберите способ связи"
    if not consent:
        errors["consent"] = "Нужно согласие на обработку данных"

    normalized = {
        "name": name,
        "phone": phone,
        "company": company,
        "hiring_volume": clean_text(lead.get("hiring_volume"), 120),
        "vacancy_types": clean_text(lead.get("vacancy_types"), 250),
        "urgency": clean_text(lead.get("urgency"), 120),
        "budget": clean_text(lead.get("budget"), 120),
        "contact_method": contact_method,
        "comment": clean_text(lead.get("comment"), 600),
        "consent": consent,
        "telegram": lead.get("telegram") or {},
        "result": lead.get("result") or {},
        "quiz_answers": lead.get("quiz_answers") or [],
        "source": "Telegram Mini App",
    }
    return errors, normalized


def build_manager_message(lead: dict) -> str:
    result = lead.get("result") or {}
    telegram = lead.get("telegram") or {}
    tg_username = telegram.get("username") or "—"
    result_roles = ", ".join(result.get("roles", [])) or "—"
    quiz_answers = lead.get("quiz_answers") or []
    quiz_summary = "\n".join(
        f"• {escape(str(item.get('question', '')))}: <b>{escape(str(item.get('answer', '')))}</b>"
        for item in quiz_answers[:8]
    ) or "• Квиз: <b>нет данных</b>"

    return (
        "🧠 <b>Новый лид • AI HR-агентство КОМЭКСПО</b>\n"
        f"• Имя: <b>{escape(lead.get('name', '—'))}</b>\n"
        f"• Телефон: <b>{escape(lead.get('phone', '—'))}</b>\n"
        f"• Компания: <b>{escape(lead.get('company', '—'))}</b>\n"
        f"• Объем найма: <b>{escape(lead.get('hiring_volume', '—'))}</b>\n"
        f"• Тип вакансий: <b>{escape(lead.get('vacancy_types', '—'))}</b>\n"
        f"• Срочность: <b>{escape(lead.get('urgency', '—'))}</b>\n"
        f"• Бюджет: <b>{escape(lead.get('budget', '—'))}</b>\n"
        f"• Способ связи: <b>{escape(lead.get('contact_method', '—'))}</b>\n"
        f"• Рекомендация: <b>{escape(result.get('title', '—'))}</b>\n"
        f"• Формат: <b>{escape(result.get('format', '—'))}</b>\n"
        f"• Роли: <b>{escape(result_roles)}</b>\n"
        f"• Telegram: <b>@{escape(tg_username)}</b>\n"
        f"• Комментарий: {escape(lead.get('comment', '—'))}\n\n"
        f"<b>Квиз</b>\n{quiz_summary}"
    )


# ---------------------------
# Routes
# ---------------------------
@app.get("/")
def index():
    return render_template("index.html", policy_url=POLICY_URL)


@app.get("/health")
def health():
    return json_response(True, ts=utc_now_iso())


@app.get("/api/config")
def api_config():
    return json_response(True, policyUrl=POLICY_URL, validateInitData=VALIDATE)


@app.post("/api/lead")
def api_lead():
    body = request.get_json(force=True, silent=True) or {}
    init_data = body.get("initData", "")
    lead = body.get("lead") or {}
    analytics = body.get("events") or []
    client_ip = get_client_ip()

    if not check_rate_limit(client_ip):
        return json_response(False, error="rate_limited"), 429

    if VALIDATE and not validate_init_data(init_data, BOT_TOKEN):
        return json_response(False, error="bad_init_data"), 403

    errors, normalized = validate_lead(lead)
    if errors:
        return json_response(False, error="validation_error", fields=errors), 400

    record = {
        "ts": utc_now_iso(),
        "lead": normalized,
        "events": analytics,
        "meta": {
            "ip": client_ip,
            "user_agent": request.headers.get("User-Agent", ""),
        },
    }

    try:
        append_jsonl(record)
        append_csv(record)
        send_to_bitrix(record)
        notify_manager(build_manager_message(normalized))
    except Exception:
        return json_response(False, error="save_error"), 500

    return json_response(True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")), debug=True)
