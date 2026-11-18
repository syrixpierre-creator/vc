'use strict';
/**
 * QUEEN AKUMA — image du bot (fichier local, plus aucune URL catbox/imgur).
 *   assets/bot_image.jpg  → image complète (menu, alive, réglages…)
 *   assets/bot_thumb.jpg  → miniature 300px (externalAdReply / aperçus)
 * En multi-session, __dirname pointe vers instances/<num>/lib : chaque bot
 * peut donc avoir sa propre image en remplaçant SON assets/bot_image.jpg.
 */
const fs = require('fs');
const path = require('path');

const BOT_IMAGE = path.join(__dirname, '..', 'assets', 'bot_image.jpg');
const BOT_THUMB = path.join(__dirname, '..', 'assets', 'bot_thumb.jpg');

function read(p) { try { return fs.readFileSync(p); } catch (_) { return null; } }

/** Buffer de l'image complète (relu à chaque appel : prend en compte un changement d'image). */
function botImageBuffer() { return read(BOT_IMAGE); }
/** Buffer de la miniature (ou de l'image complète si la miniature manque). */
function botThumbBuffer() { return read(BOT_THUMB) || read(BOT_IMAGE); }

module.exports = { BOT_IMAGE, BOT_THUMB, botImageBuffer, botThumbBuffer };
