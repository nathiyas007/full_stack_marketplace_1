from db.database import engine, Base
from models.user import User
from models.product import Product
from models.order import Order
from models.wishlist import Wishlist
from models.category import Category
from models.contact import ContactMessage
from models.qfa import Question
from models.review import Review
from models.safety_tip import SafetyTip

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Database reset complete.")
