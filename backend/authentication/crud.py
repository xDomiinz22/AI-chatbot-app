import base64
from datetime import datetime, timedelta, timezone
import os
import secrets
from backend.database.database import SessionLocal, engine, Base
from backend.database.models import EmailVerificationToken, User, Token
from backend.database.schemas import UserCreate
from passlib.context import CryptContext
import hashlib

from backend.utils.email import EmailVerificationMethods


class TokenException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail

    def __str__(self):
        return f"{self.status_code}: {self.detail}"


class EmailTokenException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail

    def __str__(self):
        return f"{self.status_code}: {self.detail}"


class DatabaseMethods:
    def __init__(self):
        Base.metadata.create_all(bind=engine)
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
        self.db = SessionLocal()
        self.email_methods = EmailVerificationMethods()

        # Cleaning tokens
        now = datetime.now(timezone.utc)
        self.db.query(Token).filter(Token.expires_at < now).delete()
        expiry_limit = now - timedelta(minutes=15)

        self.db.query(EmailVerificationToken).filter(
            EmailVerificationToken.created_at < expiry_limit
        ).delete()

        self.db.commit()

    def get_user_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    async def create_user(self, user: UserCreate) -> User:
        hashed_password = self.pwd_context.hash(user.password)
        db_user = User(
            email=user.email, hashed_password=hashed_password, name=user.name
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        email_token = self.generate_email_verification_token(user.email)
        await self.email_methods.send_verification_email(user.email, email_token)
        return db_user

    def verify_password(self, plain_password: str, hashed_password: str):
        return self.pwd_context.verify(plain_password, hashed_password)

    def create_token(self, email: str) -> Token:
        random_bytes = os.urandom(15)
        generated_token = base64.b32encode(random_bytes).decode("utf-8").rstrip("=")
        hashed_token = hashlib.sha256(generated_token.encode("utf-8")).hexdigest()
        expires = datetime.now(timezone.utc) + timedelta(hours=48)
        token = Token(email=email, expires_at=expires, token=hashed_token)
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def delete_token_by_token(self, token: str) -> bool:
        token_entry = self.db.query(Token).filter(Token.token == token).first()
        if not token_entry:
            return False
        self.db.delete(token_entry)
        self.db.commit()
        return True

    def get_user_by_token(self, token: str):
        token_entry = self.db.query(Token).filter(Token.token == token).first()

        if not token_entry:
            raise TokenException(status_code=401, detail="Invalid token")

        now = datetime.now(timezone.utc).timestamp()
        if token_entry.expires_at.timestamp() < now:
            raise TokenException(status_code=401, detail="Token expired")

        user = self.db.query(User).filter(User.email == token_entry.email).first()
        if not user:
            raise TokenException(status_code=404, detail="User not found")

        return user

    def generate_email_verification_token(self, email: str):
        token = secrets.token_urlsafe(32)
        db_token = EmailVerificationToken(email=email, token=token)
        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        return token

    def verificate_email(self, token: str):
        token_entry = (
            self.db.query(EmailVerificationToken).filter_by(token=token).first()
        )
        if not token_entry:
            raise EmailTokenException(status_code=400, detail="Invalid token")
        created_at_aware = token_entry.created_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) - created_at_aware > timedelta(minutes=15):
            self.db.delete(token_entry)
            self.db.commit()
            raise EmailTokenException(status_code=400, detail="Token expired")

        user = self.db.query(User).filter_by(email=token_entry.email).first()

        if not user:
            raise EmailTokenException(status_code=404, detail="User not found")

        user.is_verified = True
        self.db.delete(token_entry)
        self.db.commit()
