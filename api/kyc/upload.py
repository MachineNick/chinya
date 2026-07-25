from http.server import BaseHTTPRequestHandler
import os, boto3, uuid, httpx, cgi, io
from pathlib import Path
from botocore.client import Config

def _storj():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["STORJ_ENDPOINT"],
        aws_access_key_id=os.environ["STORJ_ACCESS_KEY"],
        aws_secret_access_key=os.environ["STORJ_SECRET_KEY"],
        config=Config(signature_version="s3v4",
                      request_checksum_calculation="when_required",
                      response_checksum_validation="when_required")
    )

BUCKET = os.environ.get("STORJ_BUCKET", "winzoindia-kyc")
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".pdf"}

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._cors()
        self.end_headers()

    def do_POST(self):
        import json
        ctype, pdict = cgi.parse_header(self.headers.get("Content-Type", ""))
        if ctype != "multipart/form-data":
            self._error(400, "multipart/form-data required"); return
        pdict["boundary"] = pdict["boundary"].encode()
        pdict["CONTENT-LENGTH"] = int(self.headers.get("Content-Length", 0))
        fields = cgi.parse_multipart(self.rfile, pdict)

        uid = (fields.get("uid") or [""])[0]
        token = ((fields.get("authorization") or [""])[0]).replace("Bearer ", "").strip()
        file_data = (fields.get("file") or [None])[0]
        filename = "upload"
        # try to get filename from Content-Disposition — best effort
        for part in fields:
            pass  # cgi.parse_multipart doesn't expose filename; use uid-based key

        if not uid or not token:
            self._error(401, "Unauthorized"); return

        # Validate token with Supabase
        sb_url = os.environ.get("SUPABASE_URL", "")
        sb_key = os.environ.get("SUPABASE_SERVICE_KEY", "")
        try:
            resp = httpx.get(f"{sb_url}/auth/v1/user",
                             headers={"Authorization": f"Bearer {token}", "apikey": sb_key},
                             timeout=5)
            if resp.status_code != 200 or resp.json().get("id") != uid:
                self._error(403, "Forbidden"); return
        except Exception:
            self._error(401, "Token validation failed"); return

        if file_data is None:
            self._error(400, "No file"); return
        if len(file_data) > 5 * 1024 * 1024:
            self._error(400, "File must be under 5MB"); return

        # Detect extension from magic bytes
        ext = ".jpg"
        if isinstance(file_data, (bytes, bytearray)):
            if file_data[:4] == b"%PDF": ext = ".pdf"
            elif file_data[:8] == b"\x89PNG\r\n\x1a\n": ext = ".png"

        key = f"kyc/{uid}/{uuid.uuid4().hex}{ext}"
        _storj().upload_fileobj(io.BytesIO(file_data if isinstance(file_data, bytes) else bytes(file_data)), BUCKET, key)
        url = _storj().generate_presigned_url("get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=604800)

        self._cors()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"kycUrl": url, "kycKey": key}).encode())

    def _cors(self):
        allowed = os.environ.get("CORS_ORIGIN", "https://winzoindia.vercel.app")
        self.send_header("Access-Control-Allow-Origin", allowed)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _error(self, code, msg):
        import json
        self._cors()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": msg}).encode())
