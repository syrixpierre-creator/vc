/**
 * QUEEN AKUMA • mediaSource — menu/bot media resolver.
 * Media setting ek URL bhi ho sakti hai (MENU_IMAGE env / .customize /
 * .setbot) ya local file path (default: assets/bot_image.jpg). Baileys ko sahi format do:
 *   URL  -> { url }   |   local file -> Buffer   |   missing -> null
 */
const fs = require('fs');
const path = require('path');

function isUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s);
}

function resolveMedia(value) {
  if (!value || typeof value !== 'string') return null;
  if (isUrl(value)) return { url: value };
  const p = path.isAbsolute(value) ? value : path.join(process.cwd(), value);
  try {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return fs.readFileSync(p);
  } catch {}
  return null;
}

module.exports = { isUrl, resolveMedia };
