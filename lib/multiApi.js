// QUEEN AKUMA v3.5.0 • lib/multiApi.js
// Har API-backed command me 2-3 sources rakho taaki response fast aaye:
// raceFirst = sab sources parallel, pehla success jeetta hai.
// tryEach = ek ke baad ek, pehla success jeetta hai (sequential fallback).
// withTimeout = kisi bhi promise par timeout lagata hai.

function withTimeout(promise, ms, label = 'timeout') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} (${ms}ms)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function raceFirst(tasks, timeoutMs = 12000) {
  // tasks: array of () => Promise. Sab parallel chalte hain.
  const settled = await Promise.allSettled(
    tasks.map((fn) => withTimeout(Promise.resolve().then(fn), timeoutMs, 'source timeout'))
  );
  const ok = settled.find((r) => r.status === 'fulfilled');
  if (ok) return ok.value;
  const errs = settled.map((r) => (r.reason && r.reason.message) || String(r.reason)).join(' | ');
  throw new Error('All sources failed: ' + errs);
}

async function tryEach(tasks, timeoutMs = 12000) {
  const errs = [];
  for (const fn of tasks) {
    try {
      return await withTimeout(Promise.resolve().then(fn), timeoutMs, 'source timeout');
    } catch (e) { errs.push((e && e.message) || String(e)); }
  }
  throw new Error('All sources failed: ' + errs.join(' | '));
}

module.exports = { withTimeout, raceFirst, tryEach };
