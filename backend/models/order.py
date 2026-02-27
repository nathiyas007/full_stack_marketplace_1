from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from db.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    full_name = Column(String)
    mobile = Column(String)
    address = Column(String)
    city = Column(String)
    pincode = Column(String)
    payment_method = Column(String)
    status = Column(String, default="Pending")
    cancel_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
