from http.server import BaseHTTPRequestHandler
import os, boto3, json
from urllib.parse import urlparse, parse_qs
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

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._cors()
        self.end_headers()

    def do_GET(self):
        qs = parse_qs(urlparse(self.path).query)
        key = (qs.get("key") or [""])[0]
        token = self.headers.get("Authorization", "").replace("Bearer ", "").strip()
        if not token or not key:
            self._error(401, "Unauthorized"); return
        url = _storj().generate_presigned_url("get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=3600)
        self._cors()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"url": url}).encode())

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization")

    def _error(self, code, msg):
        self._cors()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": msg}).encode())
