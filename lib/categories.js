'use strict';
/**
 * QUEEN AKUMA — category cleanup, applied when each command registers.
 *  - fei-* categories renamed (fei-anime -> anime, fei-misc -> misc, fei-status -> group…)
 *  - duplicate categories merged (downloader -> download, stickers -> sticker, games -> game)
 *  - categories with fewer than 10 commands folded into a fitting category
 */
const MAP = {
  'fei-anime': 'anime',
  'fei-misc': 'misc',
  'fei-status': 'group',
  'fei-ai': 'ai',
  downloader: 'download',
  stickers: 'sticker',
  games: 'game',
  // small categories (< 10 commands)
  random: 'fun',
  upload: 'tools',
  menu: 'general',
  music: 'download',
  religion: 'info',
  apks: 'download',
  sound: 'audio',
  convert: 'tools',
  converter: 'tools',
  image: 'maker',
  aivideo: 'ai',
  whatsapp: 'tools',
  panel: 'owner',
  editor: 'maker',
  other: 'misc',
  logo: 'design',
  math: 'tools',
  novel: 'fun',
  'stalker commands': 'stalk',
};

function mapCategory(cat) {
  const c = String(cat || 'misc').trim().toLowerCase();
  return MAP[c] || c;
}

module.exports = { mapCategory, MAP };
