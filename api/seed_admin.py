from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.user import User
from models.product import Product
from models.order import Order

def seed_admin():
    db = SessionLocal()
    admin_email = "nathiya567@gmail.com"
    admin_password = "nathiyas112"
    admin_name = "Nathiya"

    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if not existing_admin:
        new_admin = User(
            name=admin_name,
            email=admin_email,
            password=admin_password,
            is_active=1
        )
        db.add(new_admin)
        db.commit()
        print(f"Admin user {admin_email} created successfully.")
    else:
        existing_admin.password = admin_password
        db.commit()
        print(f"Admin user {admin_email} already exists. Password updated.")
    db.close()

if __name__ == "__main__":
    seed_admin()
