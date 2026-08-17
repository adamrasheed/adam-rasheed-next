"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { BarState } from "@/sanity/barTypes";

const POLL_MS = 5000;

function isBarState(value: unknown): value is BarState {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<BarState>;

  return typeof candidate.open === "boolean" && Array.isArray(candidate.orders);
}

/**
 * Polls the shared bar state. The server caches the underlying read for two
 * seconds and busts it on every write, so this stays cheap no matter how many
 * phones are open, and still reflects a change within a poll of it happening.
 */
export function useBarState(initial: BarState) {
  const [state, setState] = useState(initial);
  const [reachable, setReachable] = useState(true);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;

    inFlight.current = true;

    try {
      const response = await fetch("/api/bar/state", { cache: "no-store" });

      if (!response.ok) {
        setReachable(false);
        return;
      }

      const data: unknown = await response.json();

      if (!isBarState(data)) {
        setReachable(false);
        return;
      }

      setState(data);
      setReachable(true);
    } catch {
      // Network blip or a dropped wifi connection. Keep showing the last known
      // queue rather than blanking it, and say so in the UI.
      setReachable(false);
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    // No point polling a phone that's in someone's pocket.
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };

    const interval = window.setInterval(tick, POLL_MS);

    document.addEventListener("visibilitychange", tick);
    tick();

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  return { state, reachable, refresh, setState };
}
