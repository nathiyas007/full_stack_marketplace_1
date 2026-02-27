from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import User
from models.product import Product
from models.order import Order
from models.qfa import Question
from models.safety_tip import SafetyTip
from models.contact import ContactMessage
from schemas.qfa import QuestionAnswer, QuestionResponse
from schemas.safety_tip import SafetyTipCreate, SafetyTipUpdate, SafetyTipResponse
from schemas.contact import ContactResponse
from typing import List, Optional

router = APIRouter(prefix="/admin", tags=["Admin"])

def verify_admin(x_user_role: Optional[str] = Header(None)):
    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return x_user_role

# DASHBOARD STATS
@router.get("/stats", dependencies=[Depends(verify_admin)])
def get_stats(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_users = db.query(User).filter(User.email != "nathiya567@gmail.com").count()
    pending_qfa = db.query(Question).filter(Question.answer == None).count()

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "pending_qfa": pending_qfa
    }

# PRODUCT MANAGEMENT
@router.get("/products", dependencies=[Depends(verify_admin)])
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

@router.delete("/products/{product_id}", dependencies=[Depends(verify_admin)])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

# USER MANAGEMENT
@router.get("/users", dependencies=[Depends(verify_admin)])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.email != "nathiya567@gmail.com").all()
    return users

@router.post("/users/{user_id}/toggle-status", dependencies=[Depends(verify_admin)])
def toggle_user_status(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = 0 if user.is_active == 1 else 1
    
    # Hide/Show user products based on status
    db.query(Product).filter(Product.user_id == user_id).update({"is_active": user.is_active == 1})
    
    db.commit()
    return {"message": "User status updated", "is_active": user.is_active}

# ORDER MANAGEMENT
@router.get("/orders", dependencies=[Depends(verify_admin)])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders

@router.patch("/orders/{order_id}/status", dependencies=[Depends(verify_admin)])
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    return {"message": "Order status updated"}

# QFA MANAGEMENT
@router.get("/questions", response_model=List[QuestionResponse], dependencies=[Depends(verify_admin)])
def list_questions(db: Session = Depends(get_db)):
    return db.query(Question).all()

@router.post("/questions/{question_id}/answer", dependencies=[Depends(verify_admin)])
def answer_question(question_id: int, q_answer: QuestionAnswer, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question.answer = q_answer.answer
    db.commit()
    return {"message": "Question answered"}

@router.delete("/questions/{question_id}", dependencies=[Depends(verify_admin)])
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return {"message": "Question deleted"}

# SAFETY TIPS MANAGEMENT
@router.get("/safety-tips", response_model=List[SafetyTipResponse], dependencies=[Depends(verify_admin)])
def list_safety_tips(db: Session = Depends(get_db)):
    return db.query(SafetyTip).all()

@router.post("/safety-tips", response_model=SafetyTipResponse, dependencies=[Depends(verify_admin)])
def create_safety_tip(tip: SafetyTipCreate, db: Session = Depends(get_db)):
    new_tip = SafetyTip(**tip.dict())
    db.add(new_tip)
    db.commit()
    db.refresh(new_tip)
    return new_tip

@router.put("/safety-tips/{tip_id}", response_model=SafetyTipResponse, dependencies=[Depends(verify_admin)])
def update_safety_tip(tip_id: int, tip_update: SafetyTipUpdate, db: Session = Depends(get_db)):
    tip = db.query(SafetyTip).filter(SafetyTip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
    for key, value in tip_update.dict(exclude_unset=True).items():
        setattr(tip, key, value)
    db.commit()
    db.refresh(tip)
    return tip

@router.delete("/safety-tips/{tip_id}", dependencies=[Depends(verify_admin)])
def delete_safety_tip(tip_id: int, db: Session = Depends(get_db)):
    tip = db.query(SafetyTip).filter(SafetyTip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
    db.delete(tip)
    db.commit()
    return {"message": "Tip deleted"}

# CONTACT MESSAGES MANAGEMENT
@router.get("/contacts", response_model=List[ContactResponse], dependencies=[Depends(verify_admin)])
def list_contacts(db: Session = Depends(get_db)):
    return db.query(ContactMessage).all()

@router.delete("/contacts/{contact_id}", dependencies=[Depends(verify_admin)])
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(ContactMessage).filter(ContactMessage.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(contact)
    db.commit()
    return {"message": "Message deleted"}
