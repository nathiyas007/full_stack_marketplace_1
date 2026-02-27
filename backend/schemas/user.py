from pydantic import BaseModel

class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    mobile: str = None
    address: str = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    mobile: str = None
    address: str = None

class UserUpdate(BaseModel):
    name: str
    email: str
    mobile: str = None
    address: str = None
