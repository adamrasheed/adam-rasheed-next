export const QUERY_PARAMS = {
  CATEGORY: "category",
} as const;

export const SITE_NAME = "Adam Rasheed";

// Vercel sets NEXT_PUBLIC_VERCEL_URL without a protocol on preview deploys, so
// share previews resolve against the deployment being viewed instead of prod.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" &&
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "https://adamrasheed.com");
