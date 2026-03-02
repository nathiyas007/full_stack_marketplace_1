from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import User
from models.product import Product
from models.review import Review
from models.order import Order
from typing import Optional, List
from sqlalchemy import func

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}/profile")
def get_seller_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get products by this seller
    products = db.query(Product).filter(Product.user_id == user_id, Product.is_active == True).all()
    
    # Get reviews and average rating
    reviews = db.query(Review).filter(Review.seller_id == user_id).all()
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.seller_id == user_id).scalar() or 0
    total_reviews = len(reviews)
    
    # Prepare public response (no mobile, email, or exact address)
    return {
        "id": user.id,
        "name": user.name,
        "avg_rating": round(float(avg_rating), 1),
        "total_reviews": total_reviews,
        "products": [
            {
                "id": p.id,
                "title": p.title,
                "price": p.price,
                "image1": p.image1,
                "is_sold": p.is_sold
            } for p in products
        ],
        "reviews": [
            {
                "rating": r.rating,
                "comment": r.comment,
                "buyer_name": db.query(User.name).filter(User.id == r.buyer_id).scalar(),
                "created_at": r.created_at
            } for r in reviews
        ]
    }

@router.get("/{user_id}/contact")
def get_seller_contact(user_id: int, db: Session = Depends(get_db), x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    buyer_id = int(x_user_id)
    
    # Logic: Only show contact details if an order is Accepted, Packing, or Delivered.
    order = db.query(Order).join(Product, Order.product_id == Product.id).filter(
        Order.user_id == buyer_id,
        Product.user_id == user_id,
        Order.status != "Cancelled",
        Order.status != "Declined"
    ).first()
    
    if not order:
        raise HTTPException(status_code=403, detail="You can only view contact details after placing an order with this seller.")
    
    if order.status == "Pending":
         raise HTTPException(status_code=422, detail="Seller has not accepted your order yet.")
    
    seller = db.query(User).filter(User.id == user_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
        
    return {
        "name": seller.name,
        "email": seller.email,
        "mobile": seller.mobile,
        "address": seller.address
    }

@router.get("/{user_id}/details")
def get_user_details(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "mobile": user.mobile,
        "address": user.address
    }

from schemas.user import UserUpdate

@router.put("/{user_id}")
def update_user_profile(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email is being changed and if it's already taken
    if user_data.email != user.email:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")

    user.name = user_data.name
    user.email = user_data.email
    user.mobile = user_data.mobile
    user.address = user_data.address
    
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "name": user.name}

