/*****************************************************************************
 * QUEEN AKUMA — .help
 * Same stylish front as .menu, but EVERY command with description
 *****************************************************************************/
const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');

function prefixOf() {
  const p = settings.prefixes;
  return Array.isArray(p) && p[0] ? p[0] : '.';
}

function frameHeader(title) {
  return (
    `*ׂ̣̣̣̣̇̇̇̇᛭*\n` +
    `*❀ ${title}*\n` +
    `*❀ ${settings.botName || 'QUEEN AKUMA'} · Help*\n` +
    `*̣̣̣̣̇̇̇᛭*`
  );
}

function categorize(cmd) {
  const n = String(cmd.command || '').toLowerCase();
  const c = String(cmd.category || 'general').toLowerCase();
  if (c && c !== 'misc' && c !== 'general') return c;
  if (/kick|promote|demote|warn|mute|antilink|welcome|goodbye|tag|gstatus|lock|unlock/.test(n)) return 'admin';
  if (/play|song|ytmp3|tiktok|facebook|instagram|video|download|mediafire/.test(n)) return 'download';
  if (/ai|gpt|gemini|dexbot|imagine/.test(n)) return 'ai';
  if (/sticker|toimg|attp|qc/.test(n)) return 'sticker';
  if (/ping|alive|menu|help|owner|uptime|runtime/.test(n)) return 'main';
  return c || 'general';
}

function buildHelpPages(prefix) {
  const map = commandHandler.commands;
  if (!map || typeof map.values !== 'function') {
    return ['❌ Command list load nahi hui.'];
  }
  const byCat = new Map();
  for (const cmd of map.values()) {
    if (!cmd || !cmd.command) continue;
    // skip number-suffixed dups noise lightly
    const cat = categorize(cmd);
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(cmd);
  }

  const catOrder = [...byCat.keys()].sort((a, b) => {
    const pri = ['main', 'admin', 'group', 'download', 'music', 'ai', 'owner', 'fun'];
    const ia = pri.indexOf(a);
    const ib = pri.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const pages = [];
  let buf =
    frameHeader('📖 FULL HELP') +
    `\n\n_Total commands: *${map.size}*_\n` +
    `_Usage: \`${prefix}help <cmd>\` detail_\n` +
    `_Menu style: \`${prefix}menu\`_\n`;

  for (const cat of catOrder) {
    const list = byCat.get(cat).sort((a, b) => String(a.command).localeCompare(String(b.command)));
    let block = `\n*  ${cat.toUpperCase()} (${list.length})*\n`;
    for (const cmd of list) {
      const desc = (cmd.description || cmd.desc || '—').replace(/\n/g, ' ').slice(0, 80);
      const usage = cmd.usage || `${prefix}${cmd.command}`;
      block += `** \`${prefix}${cmd.command}\` — ${desc}\n`;
      if (cmd.usage) block += `**    ↳ \`${usage}\`\n`;
    }
    block += `**\n`;

    if ((buf + block).length > 3500) {
      pages.push(buf);
      buf = frameHeader('📖 HELP (cont.)') + '\n' + block;
    } else {
      buf += block;
    }
  }
  if (buf.trim()) pages.push(buf);
  return pages;
}

function singleHelp(prefix, name) {
  const map = commandHandler.commands;
  const aliases = commandHandler.aliases;
  let cmd = map.get(String(name).toLowerCase());
  if (!cmd && aliases && aliases.get) {
    const main = aliases.get(String(name).toLowerCase());
    if (main) cmd = map.get(main);
  }
  if (!cmd) return null;
  const als = (cmd.aliases || []).map((a) => prefix + a).join(', ') || '—';
  return (
    frameHeader(`📖 ${prefix}${cmd.command}`) +
    `\n\n` +
    `*❀ Description:* ${cmd.description || cmd.desc || '—'}\n` +
    `*❀ Category:* ${cmd.category || 'general'}\n` +
    `*❀ Usage:* \`${cmd.usage || prefix + cmd.command}\`\n` +
    `*❀ Aliases:* ${als}\n` +
    `*̣̣̣̣̇̇̇᛭*`
  );
}

module.exports = {
  command: 'help',
  aliases: ['helps', 'detailhelp', 'cmdhelp'],
  category: 'main',
  description: 'Detailed help — har command kya karti hai (menu style)',
  usage: '.help | .help <command>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const prefix = prefixOf();
    const q = (args[0] || '').toLowerCase().replace(/^\./, '');

    if (q) {
      const one = singleHelp(prefix, q);
      if (!one) {
        return sock.sendMessage(chatId, {
          text: `❌ Command *${prefix}${q}* nahi mili.\nFull list: \`${prefix}help\``
        }, { quoted: message });
      }
      return sock.sendMessage(chatId, { text: one }, { quoted: message });
    }

    const pages = buildHelpPages(prefix);
    // first page quoted, rest follow (max 4 pages to avoid spam)
    const max = Math.min(pages.length, 4);
    for (let i = 0; i < max; i++) {
      const footer = pages.length > 1 ? `\n\n_Page ${i + 1}/${pages.length}_` : '';
      await sock.sendMessage(
        chatId,
        { text: pages[i] + footer },
        i === 0 ? { quoted: message } : undefined
      );
    }
    if (pages.length > max) {
      await sock.sendMessage(chatId, {
        text: `… aur bhi commands hain.\n\`${prefix}help <name>\` se detail, \`${prefix}menu\` short list.`
      });
    }
  }
};
