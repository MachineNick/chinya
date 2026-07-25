import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hmac } from "https://esm.sh/@noble/hashes@1.3.3/hmac";
import { sha256 } from "https://esm.sh/@noble/hashes@1.3.3/sha256";

const STORJ_ENDPOINT  = "https://gateway.storjshare.io";
const STORJ_ACCESS    = Deno.env.get("STORJ_ACCESS_KEY")!;
const STORJ_SECRET    = Deno.env.get("STORJ_SECRET_KEY")!;
const BUCKET          = Deno.env.get("STORJ_BUCKET") ?? "winzoindia-kyc";
const SUPABASE_URL    = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE= Deno.env.get("SUPABASE_SERVICE_KEY")!;

function hex(buf: Uint8Array) {
  return Array.from(buf).map(b => b.toString(16).padStart(2,"0")).join("");
}
function sign(key: Uint8Array, msg: string) {
  return hmac(sha256, key, new TextEncoder().encode(msg));
}
function signingKey(secret: string, date: string, region: string, service: string) {
  const kDate    = sign(new TextEncoder().encode("AWS4" + secret), date);
  const kRegion  = sign(kDate, region);
  const kService = sign(kRegion, service);
  return sign(kService, "aws4_request");
}

function presignedPut(key: string, contentType: string, expiresIn = 3600): string {
  const now     = new Date();
  const date    = now.toISOString().slice(0,10).replace(/-/g,"");
  const time    = now.toISOString().replace(/[-:]/g,"").slice(0,15) + "Z";
  const region  = "us-east-1";
  const service = "s3";
  const host    = `gateway.storjshare.io`;
  const scope   = `${date}/${region}/${service}/aws4_request`;

  const params = new URLSearchParams({
    "X-Amz-Algorithm":     "AWS4-HMAC-SHA256",
    "X-Amz-Credential":    `${STORJ_ACCESS}/${scope}`,
    "X-Amz-Date":          time,
    "X-Amz-Expires":       String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  });

  const canonicalRequest = [
    "PUT",
    `/${BUCKET}/${key}`,
    params.toString(),
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD"
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    time,
    scope,
    hex(sha256(new TextEncoder().encode(canonicalRequest)))
  ].join("\n");

  const sig = hex(sign(signingKey(STORJ_SECRET, date, region, service), stringToSign));
  params.set("X-Amz-Signature", sig);

  return `${STORJ_ENDPOINT}/${BUCKET}/${key}?${params.toString()}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }

  // Verify Supabase JWT
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE);
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return new Response("Unauthorized", { status: 401 });

  const { filename, contentType } = await req.json();
  const ext = filename.split(".").pop().toLowerCase();
  const key = `kyc/${user.id}/${Date.now()}.${ext}`;

  const uploadUrl = presignedPut(key, contentType);
  const publicUrl = `${STORJ_ENDPOINT}/${BUCKET}/${key}`;

  return new Response(JSON.stringify({ uploadUrl, publicUrl, kycKey: key }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
});
