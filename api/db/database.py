import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    engine = None
    SessionLocal = None
    print("ERROR: DATABASE_URL not found. Database functionality will be unavailable.")
else:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"sslmode": "require"} 
    )
    SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

def get_db():
    if not SessionLocal:
        raise Exception("Database configuration is missing. Connect your database.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()