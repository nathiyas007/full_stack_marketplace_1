from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.qfa import Question
from schemas.qfa import QuestionCreate, QuestionResponse
from typing import List

router = APIRouter(prefix="/qfa", tags=["QFA"])

from models.user import User

@router.post("/ask", response_model=QuestionResponse)
def ask_question(question: QuestionCreate, db: Session = Depends(get_db)):
    # Check if user is active
    user = db.query(User).filter(User.id == question.user_id).first()
    if user and user.is_active == 0:
        raise HTTPException(status_code=403, detail="Your account is blocked. You cannot ask questions.")
        
    new_q = Question(user_id=question.user_id, question=question.question)
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

@router.get("/faq", response_model=List[QuestionResponse])
def get_faq(db: Session = Depends(get_db)):
    # Only return answered questions for public FAQ
    return db.query(Question).filter(Question.answer != None).all()
