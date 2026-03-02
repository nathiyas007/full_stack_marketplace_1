from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.safety_tip import SafetyTip
from schemas.safety_tip import SafetyTipResponse
from typing import List

router = APIRouter(prefix="/safety", tags=["Safety"])

@router.get("/tips", response_model=List[SafetyTipResponse])
def get_tips(db: Session = Depends(get_db)):
    return db.query(SafetyTip).all()
