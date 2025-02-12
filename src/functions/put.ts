import type { R2Bucket, PagesFunction } from "@cloudflare/workers-types";
import crypto from "crypto";

export const onRequestPut: PagesFunction<{
  bucket: R2Bucket;
  STORE_API_KEY: string;
}> = async ({ request, env }) => {
  if (request.headers.get("x-api-key") !== env.STORE_API_KEY)
    return new Response("unauthorized", { status: 401 });

  const value = await request.arrayBuffer();

  if (value.byteLength > 10 * 1000 * 1000)
    return new Response("content too large", { status: 413 });

  const hash = crypto
    .createHash("md5")
    .update(Buffer.from(value))
    .digest("base64");

  const key = hash
    .toLowerCase()
    .replaceAll(/[\/\+oil10]/g, "")
    .slice(0, 4);

  await env.bucket.put(key, value);

  const objectUrl = request.url.replace(/put\/?$/, key);
  const payload = { objectUrl, key };

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
