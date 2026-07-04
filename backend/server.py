from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, boto3, uuid, logging
from pathlib import Path
from botocore.client import Config
from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
load_dotenv(ROOT_DIR.parent / 'pintumosa_secrets.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Storj S3 client
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

# ── KYC Upload ────────────────────────────────────────────────
@api_router.post("/kyc/upload")
async def upload_kyc(uid: str = Form(...), file: UploadFile = File(...)):
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(400, "File must be under 5MB")
    ext = Path(file.filename).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".pdf"}:
        raise HTTPException(400, "Only JPG, PNG or PDF allowed")
    key = f"kyc/{uid}/{uuid.uuid4().hex}{ext}"
    data = await file.read()
    import io
    storj.upload_fileobj(io.BytesIO(data), BUCKET, key)
    # Generate presigned URL valid 7 days (for admin review)
    url = storj.generate_presigned_url("get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=604800)
    return {"kycUrl": url, "kycKey": key}

# ── Presigned URL for admin ───────────────────────────────────
@api_router.get("/kyc/url")
async def get_kyc_url(key: str):
    url = storj.generate_presigned_url("get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=3600)
    return {"url": url}

# ── Status check (existing) ───────────────────────────────────
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.get("/")
async def root():
    return {"message": "WinzoIndia API running"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for c in checks:
        if isinstance(c['timestamp'], str):
            c['timestamp'] = datetime.fromisoformat(c['timestamp'])
    return checks

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
