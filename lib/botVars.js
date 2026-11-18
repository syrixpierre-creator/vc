/**
 * QUEEN AKUMA — runtime vars (.setvar / .allvar)
 * Stored in data/bot-vars.json — no restart needed for most
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'data', 'bot-vars.json');

const DEFAULTS = {
  ALWAYS_ONLINE: 'false',
  CMD_REACTION: 'false',
  AUTO_STATUS_VIEW: 'off', // off | view | hide-view
  STATUS_VIEW_EMOJI: '💚,❤️,🔥,✨,👍',
  STICKER_PACKNAME: 'QUEEN AKUMA',
  STICKER_AUTHOR: 'INCONNU BOY SENSEI',
  CMD_REACTION_EMOJI: '⚡'
};

function load() {
  try {
    if (!fs.existsSync(FILE)) return { ...DEFAULTS };
    const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return { ...DEFAULTS, ...(j && typeof j === 'object' ? j : {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(data) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  return data;
}

function get(key) {
  const d = load();
  const k = String(key || '').toUpperCase();
  return d[k] !== undefined ? d[k] : process.env[k];
}

function set(key, value) {
  const d = load();
  const k = String(key || '').toUpperCase();
  d[k] = String(value);
  save(d);
  // sync a few into process.env for legacy readers
  process.env[k] = String(value);
  return d[k];
}

function getAll() {
  return load();
}

function isTrue(key) {
  const v = String(get(key) || '').toLowerCase();
  return v === 'true' || v === '1' || v === 'on' || v === 'yes';
}

function statusEmojis() {
  const raw = get('STATUS_VIEW_EMOJI') || DEFAULTS.STATUS_VIEW_EMOJI;
  return String(raw)
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickStatusEmoji() {
  const list = statusEmojis();
  if (!list.length) return '💚';
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = {
  DEFAULTS,
  load,
  save,
  get,
  set,
  getAll,
  isTrue,
  statusEmojis,
  pickStatusEmoji
};
