from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    mobile = Column(String, nullable=True)
    address = Column(String, nullable=True)
    is_active = Column(Integer, default=1)  # 1 for active, 0 for blocked

    products = relationship("Product", back_populates="owner")
