from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.category import Category

router = APIRouter(prefix="/categories", tags=["Categories"])


# GET ALL CATEGORIES
@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_active == True).all()


# CREATE CATEGORY
@router.post("/")
def create_category(name: str, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    category = Category(name=name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
