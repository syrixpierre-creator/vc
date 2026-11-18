/**
 * QUEEN AKUMA v3.0.0 — Multi-Bot Manager
 * Ek hi host par 3 tak extra WhatsApp numbers chalao.
 * Har extra bot ka apna session hota hai (session/extra_<number>),
 * apna pairing code, aur wahi saare commands chalte hain.
 * Restart par saved extra bots khud reconnect hote hain (autostart).
 */
const fs = require('fs');
const path = require('path');

const MAX_EXTRA = 3;
const SESSION_ROOT = path.join(__dirname, '..', 'session');
const bots = new Map(); // number -> { sock, status, code }

function cleanNumber(raw) {
  const d = String(raw || '').replace(/[^0-9]/g, '');
  return (d.length >= 10 && d.length <= 15) ? d : null;
}
function authDir(number) { return path.join(SESSION_ROOT, 'extra_' + number); }

async function startBot(number) {
  const baileys = require('@whiskeysockets/baileys');
  const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, DisconnectReason, delay } = baileys;
  const pino = require('pino');
  const { handleMessages } = require('./messageHandler');

  let version;
  try { ({ version } = await fetchLatestBaileysVersion()); } catch (_) {}
  const { state, saveCreds } = await useMultiFileAuthState(authDir(number));
  const sock = makeWASocket({
    ...(version ? { version } : {}),
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    defaultQueryTimeoutMs: 60000,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
  });

  const entry = { sock, status: 'connecting', code: null };
  bots.set(number, entry);

  // SPEED: group metadata 60s cache (lib/groupMetaCache.js) — clone conns
  // ka metadata bhi cache hoga, main sock jaisa.
  require('./groupMetaCache').wrapGroupMetadata(sock);

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    if (u.connection === 'open') { entry.status = 'connected'; entry.code = null; }
    else if (u.connection === 'close') {
      const code = u.lastDisconnect?.error?.output?.statusCode;
      entry.status = code === DisconnectReason.loggedOut ? 'logged-out' : 'disconnected';
    }
  });
  sock.ev.on('messages.upsert', (update) => {
    handleMessages(sock, update).catch(() => {});
  });
  return { sock, registered: !!state.creds.registered };
}

const MANAGED_MSG = 'Mode multi-session actif : chaque bot est indépendant. Ajoute/retire les bots depuis le panel du manager (ou `node manager.js add <numéro>`).';

async function addBot(rawNumber) {
  if (process.env.DEMON_MANAGED === '1') return { ok: false, error: MANAGED_MSG };
  const number = cleanNumber(rawNumber);
  if (!number) return { ok: false, error: 'Sahi number do (10-15 digits). Example: `.addbot 554488138425`' };
  if (bots.has(number)) {
    const b = bots.get(number);
    if (b.status === 'connected') return { ok: false, error: `Bot ${number} pehle se connected hai.` };
    return { ok: false, error: `Bot ${number} pehle se ${b.status} hai — .removebot ${number} karke dobara add karo.` };
  }
  if (bots.size >= MAX_EXTRA) return { ok: false, error: `Max ${MAX_EXTRA} extra bots allowed hain. Pehle .removebot se ek hatao.` };
  try {
    const { sock, registered } = await startBot(number);
    if (registered) return { ok: true, number, status: 'connected', note: 'Saved session se reconnect ho gaya.' };
    const { delay } = require('@whiskeysockets/baileys');
    await delay(1500);
    const code = await sock.requestPairingCode(number);
    const pretty = String(code).replace(/(.{4})/, '$1-');
    bots.get(number).code = pretty;
    return { ok: true, number, status: 'pairing', code: pretty };
  } catch (e) {
    bots.delete(number);
    return { ok: false, error: 'Start fail: ' + (e.message || e) };
  }
}

function listBots() {
  return [...bots.entries()].map(([number, b]) => ({ number, status: b.status }));
}
function removeBot(rawNumber) {
  const number = cleanNumber(rawNumber);
  if (!number) return { ok: false, error: 'Sahi number do.' };
  const b = bots.get(number);
  if (!b) return { ok: false, error: `Bot ${number} nahi mila. .bots se list dekho.` };
  try { b.sock.end(); } catch (_) {}
  try { b.sock.ws?.close(); } catch (_) {}
  bots.delete(number);
  try { fs.rmSync(authDir(number), { recursive: true, force: true }); } catch (_) {}
  return { ok: true, number };
}

/** Restart par saved extra bots ko khud start karo (silent, no pairing). */
async function autostart() {
  if (process.env.DEMON_MANAGED === '1') return;
  try {
    const dirs = fs.readdirSync(SESSION_ROOT).filter((d) => d.startsWith('extra_'));
    for (const d of dirs) {
      const number = d.slice(6);
      try { await startBot(number); } catch (_) {}
    }
  } catch (_) {}
}

module.exports = { addBot, listBots, removeBot, autostart, cleanNumber, MAX_EXTRA, bots };
