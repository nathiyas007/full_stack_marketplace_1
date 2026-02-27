from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from db.database import engine, Base
from routers import auth, product, wishlist, order, category, upload, admin, qfa, safety, contact, user, review
from models.review import Review

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(product.router)
app.include_router(wishlist.router)
app.include_router(order.router)
app.include_router(category.router)
app.include_router(upload.router)
app.include_router(admin.router)
app.include_router(qfa.router)
app.include_router(safety.router)
app.include_router(contact.router)
app.include_router(user.router)
app.include_router(review.router)
