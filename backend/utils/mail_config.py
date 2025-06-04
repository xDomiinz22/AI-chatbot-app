from fastapi_mail import ConnectionConfig
from pydantic import BaseModel, EmailStr, Field
from backend.config import MAIL_USERNAME, MAIL_FROM, MAIL_PASSWORD


class Settings(BaseModel):
    MAIL_USERNAME: str = MAIL_USERNAME
    MAIL_PASSWORD: str = MAIL_PASSWORD
    MAIL_FROM: EmailStr = MAIL_FROM
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "Mini-AI-Chatbot"
    MAIL_STARTTLS: bool = Field(default=True)
    MAIL_SSL_TLS: bool = Field(default=False)
    USE_CREDENTIALS: bool = Field(default=True)
    VALIDATE_CERTS: bool = Field(default=True)


conf = ConnectionConfig(
    MAIL_USERNAME=Settings().MAIL_USERNAME,
    MAIL_PASSWORD=Settings().MAIL_PASSWORD,
    MAIL_FROM=Settings().MAIL_FROM,
    MAIL_PORT=Settings().MAIL_PORT,
    MAIL_SERVER=Settings().MAIL_SERVER,
    MAIL_STARTTLS=Settings().MAIL_STARTTLS,
    MAIL_SSL_TLS=Settings().MAIL_SSL_TLS,
    MAIL_FROM_NAME=Settings().MAIL_FROM_NAME,
    USE_CREDENTIALS=Settings().USE_CREDENTIALS,
    VALIDATE_CERTS=Settings().VALIDATE_CERTS,
)
