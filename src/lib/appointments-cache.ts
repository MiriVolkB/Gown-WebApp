type CacheEntry = {
  expiresAt: number;
  payload: unknown;
};

const cache = new Map<string, CacheEntry>();
const TTL_MS = 30_000;

export function getAppointmentsCache(userId: string) {
  const entry = cache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(userId);
    return null;
  }
  return entry.payload;
}

export function setAppointmentsCache(userId: string, payload: unknown) {
  cache.set(userId, { payload, expiresAt: Date.now() + TTL_MS });
}

export function clearAppointmentsCache(userId?: string) {
  if (userId) cache.delete(userId);
  else cache.clear();
}
