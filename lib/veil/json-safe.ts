/**
 * Recursively convert values so results are safe for JSON and React RSC props.
 */
export function toJsonSafe(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') return value;
  if (value instanceof Uint8Array) return Buffer.from(value).toString('hex');
  if (Array.isArray(value)) return value.map(toJsonSafe);
  if (typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto === null || proto === Object.prototype) {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        out[k] = toJsonSafe(v);
      }
      return out;
    }
  }
  return String(value);
}
