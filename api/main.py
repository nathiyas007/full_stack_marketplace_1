from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from db.database import engine, Base, get_db
from routers import auth, product, wishlist, order, category, upload, admin, qfa, safety, contact, user, review
from models.review import Review

app = FastAPI()

import os
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database connection error: {e}")

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

app.include_router(auth.router, prefix="/api")
app.include_router(product.router, prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(order.router, prefix="/api")
app.include_router(category.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(qfa.router, prefix="/api")
app.include_router(safety.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(review.router, prefix="/api")

