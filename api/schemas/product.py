from pydantic import BaseModel
from typing import Optional
from schemas.user import UserResponse

class ProductResponse(BaseModel):
    id: int
    title: str
    price: int
    category: str
    location: str
    description: str
    condition: Optional[str] = None
    duration: Optional[str] = None
    image1: Optional[str] = None
    image2: Optional[str] = None
    image3: Optional[str] = None
    user_id: int
    is_sold: bool
    owner: Optional[UserResponse] = None

    class Config:
        orm_mode = True

class ProductCreate(BaseModel):
    title: str
    price: int
    description: str
    category: str
    location: str
    condition: Optional[str] = None
    duration: Optional[str] = None
    image1: Optional[str] = None
    image2: Optional[str] = None
    image3: Optional[str] = None
    user_id: int 

class ProductUpdate(BaseModel):
    title: str
    price: int
    description: str
    category: str
    location: str
    condition: Optional[str] = None
    duration: Optional[str] = None
    image1: Optional[str] = None
    image2: Optional[str] = None
    image3: Optional[str] = None