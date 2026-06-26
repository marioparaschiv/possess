import type { PatchParent } from "./types";

/**
 * A reference to a {@link PatchParent} that does not, by itself, prevent the parent from being
 * garbage collected. Mirrors the subset of the global {@link WeakRef} API that the patcher uses.
 */
export interface ParentRef {
  deref(): PatchParent | undefined;
}

/**
 * Strong-reference fallback for environments without {@link WeakRef} (e.g. Hermes / React Native).
 *
 * It holds the parent strongly, so unlike a real {@link WeakRef} it will keep the parent alive.
 * That is acceptable here: patch targets are typically long-lived globals, and a leak is preferable
 * to the patcher failing to load. The `.deref()` contract is preserved.
 */
class StrongRef implements ParentRef {
  #value: PatchParent;

  constructor(value: PatchParent) {
    this.#value = value;
  }

  deref(): PatchParent | undefined {
    return this.#value;
  }
}

/**
 * Wraps `parent` in a {@link WeakRef} when available, falling back to a {@link StrongRef} otherwise.
 * Both expose a `.deref()` returning the parent (or `undefined` once collected).
 */
export function createParentRef(parent: PatchParent): ParentRef {
  if (typeof WeakRef !== "undefined") return new WeakRef(parent);
  return new StrongRef(parent);
}

/**
 * Generates a random RFC 4122 v4 UUID, used to name patch callers.
 *
 * Prefers the platform `crypto.randomUUID`, then `crypto.getRandomValues`, and finally falls back
 * to `Math.random` so the patcher works in environments lacking the Web Crypto API (e.g. Hermes /
 * React Native). The `Math.random` path is not cryptographically secure, but caller ids only need
 * to be unique, not unpredictable.
 */
export function randomUUID(): string {
  const Crypto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (Crypto?.randomUUID) {
    return Crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (Crypto?.getRandomValues) {
    Crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Set the version (4) and variant (10xx) bits per RFC 4122.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex: string[] = [];
  for (let i = 0; i < 256; i++) hex.push((i + 0x100).toString(16).slice(1));

  return (
    hex[bytes[0]] +
    hex[bytes[1]] +
    hex[bytes[2]] +
    hex[bytes[3]] +
    "-" +
    hex[bytes[4]] +
    hex[bytes[5]] +
    "-" +
    hex[bytes[6]] +
    hex[bytes[7]] +
    "-" +
    hex[bytes[8]] +
    hex[bytes[9]] +
    "-" +
    hex[bytes[10]] +
    hex[bytes[11]] +
    hex[bytes[12]] +
    hex[bytes[13]] +
    hex[bytes[14]] +
    hex[bytes[15]]
  );
}
