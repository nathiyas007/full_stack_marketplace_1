from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    seller_id: int
    buyer_id: int
    order_id: int

class ReviewOut(ReviewBase):
    id: int
    buyer_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
