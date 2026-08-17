export type Guest = { id: string; name: string };

const ID_KEY = "bar.guestId";
const NAME_KEY = "bar.guestName";

/**
 * A random opaque token, minted once per browser and kept in localStorage. It
 * is the only thing tying a guest to their order: no accounts, no login, and
 * nothing personal in it.
 */
function mintGuestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return Array.from({ length: 4 }, () =>
    Math.random().toString(36).slice(2, 10)
  ).join("");
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Private mode or blocked storage. The guest just re-types their name.
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Nothing to do; ordering still works for this page view.
  }
}

export function getGuestId() {
  const existing = readStorage(ID_KEY);

  if (existing) return existing;

  const minted = mintGuestId();

  writeStorage(ID_KEY, minted);

  return minted;
}

export function loadGuest(): Guest | null {
  const name = readStorage(NAME_KEY);

  if (!name) return null;

  return { id: getGuestId(), name };
}

export function saveGuestName(name: string): Guest {
  const trimmed = name.trim();

  writeStorage(NAME_KEY, trimmed);

  return { id: getGuestId(), name: trimmed };
}

export function forgetGuestName() {
  try {
    window.localStorage.removeItem(NAME_KEY);
  } catch {
    // Ignore.
  }
}
