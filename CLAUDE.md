# CLAUDE.md

Project-level guidance for Claude Code.

## API Route conventions

- **Pin Node.js runtime** on any route that uses Node-only APIs (`crypto`, `Buffer`, etc.):
  ```ts
  export const runtime = "nodejs";
  ```
- **Validate env vars at the top** of route handlers and return a clear 500 before making any external calls — `!` non-null assertions are type-only and still produce `undefined` at runtime.
- **Guard `request.json()`** in a try/catch — malformed bodies throw.
- **Trim and type-check** user-supplied strings before use (`typeof x === "string" ? x.trim() : ""`).
- **Add `cache: "no-store"`** to all mutating `fetch` calls to external APIs (Next.js extends `fetch` with caching).
- **Guard external response parsing** — external APIs can return non-JSON bodies on errors; wrap `.json()` in try/catch and fall back to a safe message.
- **Always check the response of every `fetch` call**, including fire-and-forget side effects like tagging — surface failures to the client rather than silently swallowing them.

## Client form conventions

- Wrap `fetch` calls in try/catch to handle network errors and aborted requests.
- Guard `res.json()` separately — non-200 responses may return non-JSON.
- Wire up accessibility on inline validation errors:
  - `aria-describedby="<field>-error"` on the input
  - `id="<field>-error"` + `role="alert"` on the error `<p>`

## Mailchimp integration

- The server prefix is embedded at the end of the API key (`xxxxxxxx-us14`). Extract with `.split("-").pop()` — no separate `MAILCHIMP_SERVER_PREFIX` env var needed.
- Required env vars (add to `.env.local` and Vercel project settings):
  - `MAILCHIMP_API_KEY`
  - `MAILCHIMP_LIST_ID`
- Use `PUT /lists/{id}/members/{hash}` for upsert so returning visitors don't error.
- Apply tags via a separate `POST /lists/{id}/members/{hash}/tags` call after the upsert.
