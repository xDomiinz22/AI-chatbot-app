import os

from pydantic import EmailStr

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
SUPER_SECRET_KEY: str = os.getenv("SUPER_SECRET_KEY", "")
DATABASE_URL: str = os.getenv("DATABASE_URL", "")
MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM: EmailStr = os.getenv("MAIL_FROM", "")
