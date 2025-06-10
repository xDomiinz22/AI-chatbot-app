from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from .database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, unique=False, index=False, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)


class Token(Base):
    __tablename__ = "tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False, unique=False)


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"
    id = Column(Integer, primary_key=True)
    email = Column(String, ForeignKey("users.email"), nullable=False)
    token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))


class PasswordResetVerificationToken(Base):
    __tablename__ = "password_reset_verification_tokens"
    id = Column(Integer, primary_key=True)
    email = Column(String, ForeignKey("users.email"), nullable=False)
    token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
