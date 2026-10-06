// In-process TTL cache. Single Node process, tiny hot data (duas, system
// templates) — a Map beats external infra here. Not for per-user data.
class TTLCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key) {
    this.store.delete(key);
  }

  // get-or-load helper; concurrent callers share one in-flight promise
  async wrap(key, ttlMs, loader) {
    const hit = this.get(key);
    if (hit !== undefined) return hit;
    const inflightKey = `__inflight:${key}`;
    // Route through get() (not a raw store read) so the 30s expiresAt is
    // actually enforced: an expired in-flight entry is treated as "start a
    // fresh load" instead of blocking callers on a hung loader forever.
    let promise = this.get(inflightKey);
    if (!promise) {
      promise = loader().finally(() => this.store.delete(inflightKey));
      this.store.set(inflightKey, { value: promise, expiresAt: Date.now() + 30000 });
    }
    const value = await promise;
    this.set(key, value, ttlMs);
    return value;
  }
}

module.exports = { cache: new TTLCache() };
