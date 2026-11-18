/**
 * QUEEN AKUMA — Extra utility/games/search pack (ported from QUEEN AKUMA)
 * .country .crypto .horoscope .numfact .recipe .riddle .rps (+ aliases)
 * Adapter maps QUEEN-AKUMA-format `execute(sock,msg,args,prefix)` -> QUEEN AKUMA `handler`.
 */
const path = require('path');
const fs = require('fs');

function getPrefix(ctx) {
  try { return (ctx && ctx.prefix) || require('../lib/prefix').getPrefix(); } catch (_) { return '.'; }
}

const files = ['country', 'crypto', 'horoscope', 'numfact', 'recipe', 'riddle', 'rps'];
const commands = [];

for (const f of files) {
  const fp = path.join(__dirname, '_demon', f + '.js');
  if (!fs.existsSync(fp)) continue;
  try {
    let mod = require(fp);
    if (!Array.isArray(mod)) mod = [mod];
    for (const m of mod) {
      if (!m || !m.name || typeof m.execute !== 'function') continue;
      commands.push({
        command: String(m.name).toLowerCase(),
        aliases: m.aliases || [],
        category: m.category || 'tools',
        description: m.description || '',
        async handler(sock, message, args, ctx = {}) {
          return m.execute(sock, message, args || [], getPrefix(ctx));
        }
      });
    }
  } catch (e) {
    console.error('[demon_pack] failed to load', f, e.message);
  }
}

module.exports = { command: 'demonpack', aliases: ['inconnupack'], category: 'tools', description: 'Extra pack loader', async handler() {}, commands };
