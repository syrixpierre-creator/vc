/**
 * QUEEN AKUMA • Menu theme storage (global, bot-wide)
 * .menutheme <classic|royal|neon> se set hota hai, .menu padhta hai.
 * File: data/menutheme.json — { theme: 'classic' | 'royal' | 'neon' }
 * Default: 'classic' (koi file nahi hone par bhi classic).
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/menutheme.json');
const THEMES = ['classic', 'royal', 'neon'];

function getTheme() {
  try {
    const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const t = String(j && j.theme ? j.theme : '').toLowerCase().trim();
    return THEMES.includes(t) ? t : 'classic';
  } catch (_) {
    return 'classic';
  }
}

function setTheme(name) {
  const t = String(name || '').toLowerCase().trim();
  const v = THEMES.includes(t) ? t : 'classic';
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ theme: v }, null, 2));
  } catch (_) {}
  return v;
}

module.exports = { getTheme, setTheme, THEMES };
