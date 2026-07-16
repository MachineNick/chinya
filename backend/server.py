from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os, boto3, uuid, logging
from pathlib import Path
from botocore.client import Config

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
load_dotenv(ROOT_DIR.parent / 'pintumosa_secrets.env')

storj = boto3.client(
    "s3",
    endpoint_url=os.environ["STORJ_ENDPOINT"],
    aws_access_key_id=os.environ["STORJ_ACCESS_KEY"],
    aws_secret_access_key=os.environ["STORJ_SECRET_KEY"],
    config=Config(signature_version="s3v4",
                  request_checksum_calculation="when_required",
                  response_checksum_validation="when_required")
)
BUCKET = os.environ.get("STORJ_BUCKET", "winzoindia-kyc")

app = FastAPI()
api_router = APIRouter(prefix="/api")

@api_router.get("/")
def root():
    return {"message": "WinzoIndia API running"}

@api_router.post("/kyc/upload")
async def upload_kyc(uid: str = Form(...), file: UploadFile = File(...), authorization: str = Form(default="")):
    # Validate bearer token matches uid via Supabase JWT
    import httpx, json as _json
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(401, "Unauthorized")
    try:
        sb_url = os.environ.get("SUPABASE_URL", "")
        sb_key = os.environ.get("SUPABASE_SERVICE_KEY", "")
        resp = httpx.get(f"{sb_url}/auth/v1/user", headers={"Authorization": f"Bearer {token}", "apikey": sb_key}, timeout=5)
        user_data = resp.json()
        if resp.status_code != 200 or user_data.get("id") != uid:
            raise HTTPException(403, "Forbidden: uid mismatch")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Token validation failed")
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(400, "File must be under 5MB")
    ext = Path(file.filename).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".pdf"}:
        raise HTTPException(400, "Only JPG, PNG or PDF allowed")
    key = f"kyc/{uid}/{uuid.uuid4().hex}{ext}"
    import io
    storj.upload_fileobj(io.BytesIO(await file.read()), BUCKET, key)
    url = storj.generate_presigned_url("get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=604800)
    return {"kycUrl": url, "kycKey": key}

@api_router.get("/kyc/url")
def get_kyc_url(key: str, authorization: str = ""):
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(401, "Unauthorized")
    url = storj.generate_presigned_url("get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=3600)
    return {"url": url}

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
