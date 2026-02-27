from pydantic import BaseModel
from typing import Optional

class SafetyTipBase(BaseModel):
    title: str
    description: str
    icon: Optional[str] = None

class SafetyTipCreate(SafetyTipBase):
    pass

class SafetyTipUpdate(SafetyTipBase):
    title: Optional[str] = None
    description: Optional[str] = None

class SafetyTipResponse(SafetyTipBase):
    id: int

    class Config:
        from_attributes = True
