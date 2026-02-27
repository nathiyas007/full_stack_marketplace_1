from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.wishlist import Wishlist
from models.product import Product
from schemas.wishlist import WishlistCreate
from fastapi import Header
from models.user import User
from typing import Optional

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

# ADD TO WISHLIST
@router.post("/")
def add_wishlist(data: WishlistCreate, db: Session = Depends(get_db)):
    # Check if user is active
    user = db.query(User).filter(User.id == data.user_id).first()
    if user and user.is_active == 0:
        raise HTTPException(status_code=403, detail="Your account is blocked. You cannot use wishlist.")
    
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == data.user_id,
        Wishlist.product_id == data.product_id
    ).first()

    if existing:
        return {"message": "Product already added to wishlist"}

    wish = Wishlist(**data.dict())
    db.add(wish)
    db.commit()
    return {"message": "Added to wishlist"}

# VIEW USER WISHLIST
@router.get("/{user_id}")
def get_wishlist(user_id: int, db: Session = Depends(get_db)):
    results = db.query(Wishlist, Product).join(
        Product, Wishlist.product_id == Product.id
    ).filter(
        Wishlist.user_id == user_id,
        Product.is_active == True
    ).all()

    # Manually construct response to keep it simple without new Pydantic schemas for now
    # Or we can return a list of dicts
    return [
        {
            "wishlist_id": wish.id,
            "product": {
                "id": prod.id,
                "title": prod.title,
                "price": prod.price,
                "image1": prod.image1, 
                "category": prod.category
            }
        }
        for wish, prod in results
    ]

# REMOVE FROM WISHLIST BY USER/PRODUCT
@router.delete("/user/{user_id}/product/{product_id}")
def remove_from_wishlist_by_product(user_id: int, product_id: int, db: Session = Depends(get_db)):
    wish = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.product_id == product_id
    ).first()

    if not wish:
        raise HTTPException(status_code=404, detail="Wishlist entry not found")

    db.delete(wish)
    db.commit()
    return {"message": "Removed from wishlist"}

# REMOVE FROM WISHLIST BY ID
@router.delete("/{wishlist_id}")
def remove_wishlist(wishlist_id: int, db: Session = Depends(get_db)):
    wish = db.query(Wishlist).filter(Wishlist.id == wishlist_id).first()

    if not wish:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(wish)
    db.commit()
    return {"message": "Removed from wishlist"}
