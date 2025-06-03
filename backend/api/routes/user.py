from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from backend.authentication.crud import (
    TokenException,
    create_user,
    delete_token_by_token,
    get_user_by_email,
    verify_password,
    create_token,
    get_user_by_token,
)
from backend.database.database import SessionLocal, engine, Base
from backend.database.schemas import UserCreate, UserLogin, UserOut

Base.metadata.create_all(bind=engine)
token_auth = HTTPBearer()

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user, user_token = create_user(db, user)
    return UserOut(user_id=db_user.user_id, email=db_user.email, token=user_token.token)


@router.post("/login", response_model=UserOut)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_token = create_token(db, db_user.user_id)
    return UserOut(user_id=db_user.user_id, email=db_user.email, token=user_token.token)


@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(token_auth),
    db: Session = Depends(get_db),
):
    print("ayo")
    deleted = delete_token_by_token(db, credentials.credentials)
    if not deleted:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"message": "Logged out"}


@router.post("/validate-token")
def validate_user(
    credentials: HTTPAuthorizationCredentials = Depends(token_auth),
    db: Session = Depends(get_db),
):
    try:
        user = get_user_by_token(db, credentials.credentials)
    except TokenException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return user
