from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    email: str
    expires_at: int
    token: str


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    email: EmailStr
    token: str
    is_verified: bool

    model_config = {"from_attributes": True}
