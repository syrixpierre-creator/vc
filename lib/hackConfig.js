/**
 * QUEEN AKUMA v3.2.0 — .hack customise config
 * data/hack.json me owner ki settings: hacker name, success message,
 * speed, steps (count + custom text per step), on/off.
 */
const fs = require('fs');
const path = require('path');
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'hack.json');

const DEFAULT_STEPS = [
  '💻 Initializing hack sequence...',
  '🔌 Connecting to WhatsApp servers...',
  '🛡 Bypassing firewalls and security...',
  '🔐 Cracking encryption keys...',
  '📥 Downloading sensitive data...',
  '💥 Target compromised!',
];
const DEFAULTS = {
  enabled: true,
  hackerName: 'QUEEN-AKUMA-HACKER',
  speed: 'normal', // fast | normal | slow
  successMsg: '💥 *HACK COMPLETE!* 🎯\n\n{user} successfully hacked by *{hacker}* 😈\n\n🔑 Passwords: found\n📸 Photos: downloaded\n📍 Location: tracked\n\n_Just a prank — koi asli hack nahi hua! 😄_',
  steps: DEFAULT_STEPS.slice(),
};
const SPEEDS = { fast: 400, normal: 900, slow: 1800 };

function load() {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return { ...DEFAULTS, ...cfg, steps: Array.isArray(cfg.steps) && cfg.steps.length ? cfg.steps : DEFAULT_STEPS.slice() };
  } catch (_) { return { ...DEFAULTS, steps: DEFAULT_STEPS.slice() }; }
}
function save(cfg) {
  try { fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true }); fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2)); return true; } catch (_) { return false; }
}
function reset() { save({ ...DEFAULTS, steps: DEFAULT_STEPS.slice() }); return load(); }
function delayFor(speed) { return SPEEDS[speed] || SPEEDS.normal; }
function renderSuccess(cfg, targetName, targetJid) {
  return cfg.successMsg.replace(/\{user\}/g, targetName).replace(/\{hacker\}/g, cfg.hackerName);
}
module.exports = { load, save, reset, delayFor, renderSuccess, DEFAULTS, DEFAULT_STEPS, SPEEDS };
