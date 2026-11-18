/**
 * QUEEN AKUMA shared globals.
 * Many command files (ported from other bots) use free variables such as `fakeSender`, `fs`, `path`, `axios`,
 * `exec`, `promisify`, `downloadContentFromMessage` ... without importing them. Provide them lazily here so those
 * commands work instead of failing with "X is not defined". A file that declares its own variable is unaffected.
 */
const lazy = (name, getter) => {
  if (Object.prototype.hasOwnProperty.call(global, name)) return;
  let cache; let loaded = false;
  Object.defineProperty(global, name, {
    configurable: true,
    get() { if (!loaded) { try { cache = getter(); } catch (_) { cache = undefined; } loaded = true; } return cache; },
    set(v) { cache = v; loaded = true; }
  });
};

lazy('fs', () => require('fs'));
lazy('path', () => require('path'));
lazy('https', () => require('https'));
lazy('http', () => require('http'));
lazy('os', () => require('os'));
lazy('exec', () => require('child_process').exec);
lazy('promisify', () => require('util').promisify);
lazy('axios', () => require('axios'));
lazy('wait', () => (ms) => new Promise((r) => setTimeout(r, Number(ms) || 0)));
lazy('sleep', () => (ms) => new Promise((r) => setTimeout(r, Number(ms) || 0)));
lazy('downloadContentFromMessage', () => require('@whiskeysockets/baileys').downloadContentFromMessage);
lazy('downloadMediaMessage', () => require('@whiskeysockets/baileys').downloadMediaMessage);
lazy('TEMP_DIR', () => { const p = require('path').join(process.cwd(), 'tmp'); try { require('fs').mkdirSync(p, { recursive: true }); } catch (_) {} return p; });
// the quoted "fake contact" card used as { quoted: fakeSender }
lazy('fakeSender', () => require('./fakevCard').fakevCard);
