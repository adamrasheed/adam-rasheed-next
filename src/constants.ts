export const QUERY_PARAMS = {
  CATEGORY: "category",
} as const;

export const SITE_NAME = "Adam Rasheed";

// `new URL(SITE_URL)` in the root layout throws on an empty string or a bare
// host, so a stray `NEXT_PUBLIC_SITE_URL=` or `NEXT_PUBLIC_SITE_URL=example.com`
// would crash the whole app rather than degrade. Normalize instead.
function absoluteUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Vercel sets NEXT_PUBLIC_VERCEL_URL without a protocol on preview deploys, so
// share previews resolve against the deployment being viewed instead of prod.
export const SITE_URL =
  absoluteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
    ? absoluteUrl(process.env.NEXT_PUBLIC_VERCEL_URL)
    : undefined) ??
  "https://adamrasheed.com";
