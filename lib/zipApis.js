/**
 * QUEEN AKUMA • zipApis — working APIs mined from the user's uploaded zips
 * (QUEEN-AKUMA-PRO, QUEEN-AKUMA-Mini, AURA_XMD, 1520_plugins) and live-probed
 * 2026-11-14. Only no-key, free endpoints that returned real data are here.
 * Working: Popcat (pickup lines, IMDB, periodic table, joke),
 * some-random-api (joke, dog facts, anime quotes), api-faa (Wikipedia, brat HD).
 * NOT included: keyed services (shizoapi, nexoracle, discardapi, stacktoy),
 * paywalled (arslan 402), unreachable from this VM (tikwm, zenzxz,
 * fastrestapis — likely egress filtering, not proven dead), NSFW hosts.
 */
const https = require('https');
const http = require('http');

function getJson(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout, headers: { 'User-Agent': 'QUEEN-AKUMA/2.5' } }, (res) => {
      if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Bad JSON from API')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function getBuffer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout, headers: { 'User-Agent': 'QUEEN-AKUMA/2.5' } }, (res) => {
      if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const enc = encodeURIComponent;

async function popcatPickup() {
  const d = await getJson('https://api.popcat.xyz/pickuplines');
  return d.pickupline || null;
}

async function popcatImdb(q) {
  const d = await getJson('https://api.popcat.xyz/imdb?q=' + enc(q));
  if (!d || !d.title) return null;
  return d;
}

async function popcatElement(q) {
  const d = await getJson('https://api.popcat.xyz/periodic-table?element=' + enc(q));
  if (!d || !d.name) return null;
  return d;
}

async function popcatJoke() {
  const d = await getJson('https://api.popcat.xyz/joke');
  return d.joke || null;
}

async function sraJoke() {
  const d = await getJson('https://api.some-random-api.com/joke');
  return d.joke || null;
}

async function sraDogFact() {
  const d = await getJson('https://api.some-random-api.com/facts/dog');
  return d.fact || null;
}

async function sraAnimuQuote() {
  const d = await getJson('https://api.some-random-api.com/animu/quote');
  if (!d || !d.quote) return null;
  return d;
}

async function faaWiki(q) {
  const d = await getJson('https://api-faa.my.id/faa/Wikipedia-search?q=' + enc(q));
  const r = d && d.result;
  if (!r || !r.title) return null;
  return r;
}

async function faaBrat(text) {
  return getBuffer('https://api-faa.my.id/faa/brathd?text=' + enc(text));
}

module.exports = {
  getJson, getBuffer,
  popcatPickup, popcatImdb, popcatElement, popcatJoke,
  sraJoke, sraDogFact, sraAnimuQuote,
  faaWiki, faaBrat,
};
