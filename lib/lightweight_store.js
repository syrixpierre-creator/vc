'use strict';
/**
 * Store entry point. Normal mode: the single store of this bot.
 * HUB MODE (all bots in one process): one store per bot, created inside the
 * bot's context (its own baileys_store.db / .json), picked by the bot running.
 */
const bc = require('./botContext');
const IMPL = require.resolve('./lightweight_store_impl');

if (!bc.HUB) {
  module.exports = require(IMPL);
} else {
  const fresh = () => {
    delete require.cache[IMPL];
    const s = require(IMPL);
    delete require.cache[IMPL];
    return s;
  };
  let base = null; // store used outside any bot (hub start, manager)
  const pick = () => {
    const c = bc.current();
    if (!c) return base || (base = fresh());
    if (!c.store) c.store = fresh();
    return c.store;
  };
  module.exports = new Proxy({}, {
    get(_, k) { const st = pick(); const v = st[k]; return typeof v === 'function' ? v.bind(st) : v; },
    set(_, k, v) { pick()[k] = v; return true; },
    has(_, k) { return k in pick(); },
    ownKeys() { return Reflect.ownKeys(pick()); },
    getOwnPropertyDescriptor(_, k) { const d = Reflect.getOwnPropertyDescriptor(pick(), k); if (d) d.configurable = true; return d; },
  });
}
