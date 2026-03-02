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

    # FALLBACK: Save to /tmp if Cloudinary fails (ephemeral storage)
    print(f"Cloudinary failed ({error}). Falling back to temporary local storage...")
    
    try:
        # Generate unique filename
        ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4()}{ext}"
        
        # In Vercel, only /tmp is writable
        # But we still want to keep local static for local dev if possible
        if os.environ.get("VERCEL"):
            upload_dir = "/tmp/uploads"
        else:
            upload_dir = os.path.join(os.getcwd(), "static", "uploads")
        
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, unique_name)
        
        # Reset file pointer and save
        file.file.seek(0)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Warning: /tmp files might not be publicly served!
        # This fallback is primarily for debugging or local dev.
        return {
            "url": f"/static/uploads/{unique_name}", 
            "note": f"Uploaded to temporary storage because Cloudinary failed: {error}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Cloudinary error: {error}. Local fallback also failed: {str(e)}"
        )
