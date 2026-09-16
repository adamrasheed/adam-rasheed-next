import { handlers } from "@/auth";

// Auth.js signs session tokens with node:crypto.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
