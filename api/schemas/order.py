from pydantic import BaseModel
from datetime import datetime

class OrderCreate(BaseModel):
    user_id: int
    product_id: int
    full_name: str
    mobile: str
    address: str
    city: str
    pincode: str
    payment_method: str

class OrderStatusUpdate(BaseModel):
    status: str
    cancel_reason: str = None

class OrderCancel(BaseModel):
    cancel_reason: str


class OrderResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    full_name: str
    mobile: str
    address: str
    city: str
    pincode: str
    status: str
    cancel_reason: str = None
    created_at: datetime


    class Config:
        orm_mode = True
