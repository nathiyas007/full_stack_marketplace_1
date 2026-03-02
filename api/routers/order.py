from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.order import Order
from models.product import Product
from schemas.order import OrderCreate, OrderStatusUpdate
from models.wishlist import Wishlist
from fastapi import Header
from models.user import User
from typing import Optional

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/")
def place_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Check if user is active
    user = db.query(User).filter(User.id == order.user_id).first()
    if user and user.is_active == 0:
        raise HTTPException(status_code=403, detail="Your account is blocked. You cannot place orders.")

    new_order = Order(
        user_id=order.user_id,
        product_id=order.product_id,
        full_name=order.full_name,
        mobile=order.mobile,
        address=order.address,
        city=order.city,
        pincode=order.pincode,
        payment_method=order.payment_method
    )

    # Mark product as sold
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if product:
        product.is_sold = True
        
        # Remove from all wishlists
        db.query(Wishlist).filter(Wishlist.product_id == order.product_id).delete()

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return {
        "message": "Order placed successfully",
        "order_id": new_order.id
    }


@router.get("/user/{user_id}")
def get_orders_by_user(user_id: int, db: Session = Depends(get_db)):
    results = db.query(Order, Product).join(
        Product, Order.product_id == Product.id
    ).filter(
        Order.user_id == user_id
    ).all()

    return [
        {
            "id": order.id,
            "product_id": order.product_id,
            "product_title": product.title,
            "product_image": product.image1,
            "product_price": product.price,
            "status": order.status,
            "cancel_reason": order.cancel_reason,
            "created_at": order.created_at,
            "address": order.address,
            "city": order.city,
            "pincode": order.pincode,
            "seller_id": product.user_id
        }
        for order, product in results
    ]

# GET SELLER ORDERS (Incoming)
@router.get("/seller/{seller_id}")
def get_seller_orders(seller_id: int, db: Session = Depends(get_db)):
    # Join Order and Product to find orders where product.user_id == seller_id
    results = db.query(Order, Product).join(
        Product, Order.product_id == Product.id
    ).filter(
        Product.user_id == seller_id
    ).all()

    # Construct custom response
    return [
        {
            "order_id": order.id,
            "product_title": product.title,
            "product_price": product.price,
            "product_image": product.image1,
            "buyer_name": order.full_name,
            "buyer_mobile": order.mobile,
            "buyer_address": f"{order.address}, {order.city}, {order.pincode}",
            "status": order.status,
            "cancel_reason": order.cancel_reason,
            "created_at": order.created_at
        }
        for order, product in results
    ]

# UPDATE ORDER STATUS
@router.put("/{order_id}/status")
def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db), x_user_id: Optional[str] = Header(None)):
    if x_user_id:
        user = db.query(User).filter(User.id == int(x_user_id)).first()
        if user and user.is_active == 0:
            raise HTTPException(status_code=403, detail="Your account is blocked. You cannot update order status.")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Logic for cancellation or decline
    if status_update.status in ["Cancelled", "Declined"]:
        if order.status != "Pending":
            raise HTTPException(status_code=400, detail=f"Order can only be {status_update.status.lower()} while Pending.")
        
        order.status = status_update.status
        if status_update.status == "Cancelled":
            order.cancel_reason = status_update.cancel_reason
        
        # Release product
        product = db.query(Product).filter(Product.id == order.product_id).first()
        if product:
            product.is_sold = False
            
    else:
        # Standard status update (Accepted, etc)
        order.status = status_update.status

    db.commit()
    return {"message": f"Order status updated to {status_update.status}"}

# GET SINGLE ORDER
@router.get("/{order_id}")
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    result = db.query(Order, Product).join(
        Product, Order.product_id == Product.id
    ).filter(
        Order.id == order_id
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="Order not found")

    order, product = result
    
    return {
        "id": order.id,
        "product_title": product.title,
        "product_price": product.price,
        "product_image": product.image1,
        "status": order.status,
        "created_at": order.created_at,
        "payment_method": order.payment_method,
        "delivery_estimate": "Within 3-5 days" # Static for now, could be dynamic
    }
