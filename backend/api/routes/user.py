from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from backend.authentication.crud import (
    DatabaseMethods,
    EmailTokenException,
    TokenException,
)
from backend.database.schemas import UserCreate, UserLogin, UserOut

token_auth = HTTPBearer()
router = APIRouter()
db_methods = DatabaseMethods()


@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    db_user = db_methods.get_user_by_email(user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = await db_methods.create_user(user)
    return UserOut(
        email=db_user.email,
        token="",
        is_verified=db_user.is_verified,
    )


@router.post("/login", response_model=UserOut)
def login(user: UserLogin):
    db_user = db_methods.get_user_by_email(user.email)
    if not db_user or not db_methods.verify_password(
        user.password, db_user.hashed_password
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if db_user.is_verified:
        user_token = db_methods.create_token(db_user.email)
        return UserOut(
            email=db_user.email,
            token=user_token.token,
            is_verified=db_user.is_verified,
        )
    return UserOut(
        email=db_user.email,
        token="",
        is_verified=db_user.is_verified,
    )


@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(token_auth),
):
    deleted = db_methods.delete_token_by_token(credentials.credentials)
    if not deleted:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"message": "Logged out"}


@router.post("/validate-token")
def validate_user(
    credentials: HTTPAuthorizationCredentials = Depends(token_auth),
):
    try:
        user = db_methods.get_user_by_token(credentials.credentials)
    except TokenException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return user


@router.get("/verify-email")
def verify_email(token: str):
    try:
        db_methods.verificate_email(token)
    except EmailTokenException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return RedirectResponse(url="http://localhost:5173/login?verified=true", status_code=302)
