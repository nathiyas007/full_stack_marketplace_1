from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import User
from schemas.user import UserSignup, UserLogin
from models.product import Product
from models.order import Order

  
router = APIRouter(prefix="/auth", tags=["Auth"])

# SIGNUP
@router.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=user.password,
        mobile=user.mobile,
        address=user.address
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# LOGIN
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        User.email == user.email,
        User.password == user.password
    ).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if db_user.is_active == 0:
        raise HTTPException(status_code=403, detail="Your account has been blocked by the admin.")

    role = "admin" if db_user.email == "nathiya567@gmail.com" else "user"

    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "name": db_user.name,
        "role": role
    }

@router.get("/{user_id}/profile")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sell_count = db.query(Product).filter(Product.user_id == user_id).count()
    buy_count = db.query(Order).filter(Order.user_id == user_id).count()

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "sell_count": sell_count,
        "buy_count": buy_count
    }