import base64
from datetime import datetime, timedelta, timezone
import os
from sqlalchemy.orm import Session
from backend.database.models import User, Token
from backend.database.schemas import UserCreate
from passlib.context import CryptContext
import hashlib

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class TokenException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail

    def __str__(self):
        return f"{self.status_code}: {self.detail}"


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = pwd_context.hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_token(db, user_id=db_user.user_id)
    return db_user, token


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_token(db: Session, user_id: int) -> Token:
    random_bytes = os.urandom(15)
    generated_token = base64.b32encode(random_bytes).decode("utf-8").rstrip("=")
    hashed_token = hashlib.sha256(generated_token.encode("utf-8")).hexdigest()
    expires = datetime.now(timezone.utc) + timedelta(hours=48)
    token = Token(user_id=user_id, expires_at=expires, token=hashed_token)
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def delete_token_by_token(db: Session, token: str) -> bool:
    token_entry = db.query(Token).filter(Token.token == token).first()
    if not token_entry:
        return False
    db.delete(token_entry)
    db.commit()
    return True


def get_user_by_token(db: Session, token: str):
    token_entry = db.query(Token).filter(Token.token == token).first()

    if not token_entry:
        raise TokenException(status_code=401, detail="Invalid token")

    now = datetime.now(timezone.utc).timestamp()
    if token_entry.expires_at.timestamp() < now:
        raise TokenException(status_code=401, detail="Token expired")

    user = db.query(User).filter(User.user_id == token_entry.user_id).first()
    if not user:
        raise TokenException(status_code=404, detail="User not found")

    return user
