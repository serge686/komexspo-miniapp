import asyncio
import os

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "").rstrip("/") + "/"

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN is not set")
if WEBAPP_URL == "/":
    raise RuntimeError("WEBAPP_URL is not set")


dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message):
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Открыть Mini App", web_app=WebAppInfo(url=WEBAPP_URL))],
            [InlineKeyboardButton(text="🧩 Подобрать решение", web_app=WebAppInfo(url=f"{WEBAPP_URL}?screen=quiz"))],
            [InlineKeyboardButton(text="📝 Оставить заявку", web_app=WebAppInfo(url=f"{WEBAPP_URL}?screen=lead"))],
        ]
    )
    await message.answer(
        "КОМЭКСПО • AI HR-агентство\n\n"
        "Открой Mini App, пройди быстрый квиз за 2–3 минуты и получи рекомендацию по найму и HR-автоматизации.",
        reply_markup=kb,
    )


async def main():
    bot = Bot(BOT_TOKEN)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
