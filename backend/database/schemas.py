from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    user_id: int
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
    user_id: int
    email: EmailStr
    token: str

    model_config = {"from_attributes": True}
