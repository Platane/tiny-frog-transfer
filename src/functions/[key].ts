import type { R2Bucket, PagesFunction } from "@cloudflare/workers-types";

export const onRequestGet: PagesFunction<
  {
    bucket: R2Bucket;
    STORE_API_KEY: string;
  },
  "key"
> = async ({ request, env, params }) => {
  const key = (params.key as string).split(".")[0].toLowerCase();

  const value = await env.bucket.get(key);

  if (!value) return new Response("no value for this key", { status: 404 });

  return new Response(await value.arrayBuffer());
};
