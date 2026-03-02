import shutil
import uuid
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from utils.cloudinary_utils import upload_image

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    """
    Uploads an image file to Cloudinary with local fallback.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")
    
    # Try Cloudinary first
    image_url = None
    try:
        image_url, error = upload_image(file)
    except Exception:
        error = "Cloudinary service error"

    if image_url:
        return {"url": image_url}

    # FALLBACK: Save locally if Cloudinary fails (e.g. no internet/DNS error)
    print(f"Cloudinary failed ({error}). Falling back to local storage...")
    
    try:
        # Generate unique filename
        ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4()}{ext}"
        upload_dir = "static/uploads"
        
        # Ensure dir exists (already should, but good practice)
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, unique_name)
        
        # Reset file pointer and save
        file.file.seek(0)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return local path (assuming server runs on localhost:8000)
        # In a real setup, this base URL should be in .env
        local_url = f"http://127.0.0.1:8000/static/uploads/{unique_name}"
        return {"url": local_url, "note": "Uploaded locally due to Cloudinary connection issue"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local upload also failed: {str(e)}")
