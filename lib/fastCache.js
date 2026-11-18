/**
 * QUEEN AKUMA • fastCache — tiny in-memory TTL cache (v2.4.0, speed)
 * Slow-changing API answers (currency rates, weather) dobara fetch karne
 * ki jagah memory se do — repeat queries instant.
 */
const store = new Map(); // key -> { v, t, ttl }

function get(key) {
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() - e.t > e.ttl) { store.delete(key); return undefined; }
  return e.v;
}

function set(key, value, ttlMs) {
  if (store.size > 500) { // memory leak guard: sabse purana hatao
    const first = store.keys().next().value;
    if (first !== undefined) store.delete(first);
  }
  store.set(key, { v: value, t: Date.now(), ttl: ttlMs });
}

function del(key) { store.delete(key); }
function clear() { store.clear(); }

module.exports = { get, set, del, clear };
