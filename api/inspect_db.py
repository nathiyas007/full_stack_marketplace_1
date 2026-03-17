
import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("DATABASE_URL")
engine = create_engine(url)

try:
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    for table in tables:
        columns = [c['name'] for c in inspector.get_columns(table)]
        print(f"Table {table} columns: {columns}")
except Exception as e:
    print(f"Error inspecting DB: {e}")
