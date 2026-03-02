from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuestionBase(BaseModel):
    question: str

class QuestionCreate(QuestionBase):
    user_id: int

class QuestionAnswer(BaseModel):
    answer: str

class QuestionResponse(QuestionBase):
    id: int
    user_id: int
    answer: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
