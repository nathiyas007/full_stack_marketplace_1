from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from db.database import Base

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True) # Optional, if logged in
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    issue_type = Column(String, nullable=False) # e.g., 'Scam Report', 'Payment Issue', 'Login Problem'
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
