from sqlalchemy import Column, Integer, String, Text
from db.database import Base

class SafetyTip(Base):
    __tablename__ = "safety_tips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, nullable=True)  # FontAwesome class name
