import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_image(file_obj):
    """
    Uploads a file object (FastAPI UploadFile) to Cloudinary.
    Returns (url, error_message).
    """
    try:
        # seek(0) is important if the file was read before, though usually fresh here
        file_obj.file.seek(0)
        response = cloudinary.uploader.upload(file_obj.file)
        return response.get("secure_url"), None
    except Exception as e:
        print(f"Cloudinary Upload Error: {e}")
        return None, str(e)
