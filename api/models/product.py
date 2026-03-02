from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    description = Column(Text)
    category = Column(String)
    location = Column(String)
    image1 = Column(String, nullable=True)
    image2 = Column(String, nullable=True)
    image3 = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    is_sold = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    owner = relationship("User", back_populates="products")
