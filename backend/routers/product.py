from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate, ProductResponse
from fastapi import FastAPI, HTTPException, Header
from models.user import User
from typing import Optional

router = APIRouter(prefix="/products", tags=["Products"])

# GET ALL PRODUCTS
@router.get("/")
def get_all_products(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.is_active == True).all()

# GET SINGLE PRODUCT
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.id == product_id).first()

# SEARCH PRODUCT
@router.get("/search/")
def search_product(query: str, db: Session = Depends(get_db)):
    return db.query(Product).filter(
        Product.title.ilike(f"%{query}%"),
        Product.is_active == True
    ).all()

# CATEGORY FILTER
@router.get("/category/{category_name}")
def category_filter(category_name: str, db: Session = Depends(get_db)):
    return db.query(Product).filter(
        Product.category == category_name,
        Product.is_active == True
    ).all()

@router.post("/")
def create_product(product: ProductCreate, db: Session = Depends(get_db), x_user_id: Optional[str] = Header(None)):
    if x_user_id:
        user = db.query(User).filter(User.id == int(x_user_id)).first()
        if user and user.is_active == 0:
            raise HTTPException(status_code=403, detail="Your account is blocked. You cannot post products.")
    
    new_product = Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"message": "Product posted successfully"}

# UPDATE PRODUCT
@router.put("/{product_id}")
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db), x_user_id: Optional[str] = Header(None)):
    if x_user_id:
        user = db.query(User).filter(User.id == int(x_user_id)).first()
        if user and user.is_active == 0:
            raise HTTPException(status_code=403, detail="Your account is blocked. You cannot update products.")
    
    db_product = db.query(Product).filter(Product.id == product_id).first()

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product.dict().items():
        setattr(db_product, key, value)

    db.commit()
    return {"message": "Product updated successfully"}

from models.order import Order
from models.wishlist import Wishlist
from models.review import Review

# DELETE PRODUCT
@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), x_user_id: Optional[str] = Header(None)):
    db_product = db.query(Product).filter(Product.id == product_id).first()

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if x_user_id and db_product.user_id != int(x_user_id):
        raise HTTPException(status_code=403, detail="You can only delete your own products.")

    # Manually cascade delete to avoid IntegrityError
    db.query(Wishlist).filter(Wishlist.product_id == product_id).delete()
    
    # Delete reviews associated with orders of this product
    orders = db.query(Order).filter(Order.product_id == product_id).all()
    for order in orders:
        db.query(Review).filter(Review.order_id == order.id).delete()
        
    db.query(Order).filter(Order.product_id == product_id).delete()

    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}

@router.get("/user/{user_id}")
def get_products_by_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.user_id == user_id).all()

