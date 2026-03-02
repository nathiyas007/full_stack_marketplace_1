from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from db.database import get_db
from models.review import Review
from models.order import Order
from models.product import Product
from schemas.review import ReviewCreate
from typing import Optional

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/")
def submit_review(review: ReviewCreate, db: Session = Depends(get_db), x_user_id: Optional[str] = Header(None)):
    if not x_user_id or int(x_user_id) != review.buyer_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Check if order exists, belongs to buyer, and is delivered
    order = db.query(Order).filter(Order.id == review.order_id, Order.user_id == review.buyer_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "Delivered":
        raise HTTPException(status_code=400, detail="Reviews can only be given for delivered orders.")
        
    # Check if user already reviewed this order
    existing_review = db.query(Review).filter(Review.order_id == review.order_id).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this order.")

    # Get seller ID from product
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if not product:
         raise HTTPException(status_code=404, detail="Product not found")

    if product.user_id != review.seller_id:
         raise HTTPException(status_code=400, detail="Merchant mismatch")

    new_review = Review(
        seller_id=review.seller_id,
        buyer_id=review.buyer_id,
        order_id=review.order_id,
        rating=review.rating,
        comment=review.comment
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {"message": "Review submitted successfully", "id": new_review.id}
