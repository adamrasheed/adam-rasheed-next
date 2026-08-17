"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HostLogin() {
  const router = useRouter();

  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!passcode.trim()) {
      setError("Enter the passcode.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/bar/host/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ passcode }),
      });

      if (!response.ok) {
        let message = "Wrong passcode.";

        try {
          const data: unknown = await response.json();

          if (typeof data === "object" && data !== null && "error" in data) {
            const value = (data as { error: unknown }).error;

            if (typeof value === "string") message = value;
          }
        } catch {
          // Non-JSON body. Keep the default message.
        }

        setError(message);
        return;
      }

      setPasscode("");
      router.refresh();
    } catch {
      setError("Lost the connection. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 max-w-xs">
      <label htmlFor="host-passcode">Passcode</label>
      <input
        id="host-passcode"
        type="password"
        value={passcode}
        onChange={(event) => setPasscode(event.target.value)}
        aria-describedby={error ? "host-passcode-error" : undefined}
        autoComplete="current-password"
      />

      {error && (
        <p id="host-passcode-error" role="alert" className="text-sm font-bold">
          {error}
        </p>
      )}

      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? "Checking" : "Sign in"}
      </button>
    </form>
  );
}
