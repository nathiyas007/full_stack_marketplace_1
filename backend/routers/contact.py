from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.contact import ContactMessage
from schemas.contact import ContactCreate, ContactResponse

router = APIRouter(prefix="/contact", tags=["Contact"])

@router.post("/send", response_model=ContactResponse)
def send_message(message: ContactCreate, db: Session = Depends(get_db)):
    new_message = ContactMessage(**message.dict())
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message
