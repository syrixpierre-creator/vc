/**
 * QUEEN AKUMA — Full All Menu (native, stable)
 * .allmenu
 */
const os = require('os');
const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');

function toBold(text) {
  const map = {
    A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',
    N:'𝐍',O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',
    a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',
    n:'𝐧',o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',
    '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗'
  };
  return String(text).split('').map(c => map[c] || c).join('');
}

function toSans(text) {
  const map = {
    A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',
    N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
    a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',
    n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇'
  };
  return String(text).split('').map(c => map[c] || c).join('');
}

module.exports = {
  command: 'allmenu',
  aliases: ['fullmenu', 'menulist', 'commandlist', 'cmdlist'],
  category: 'general',
  description: 'Show full command list by category',
  usage: '.allmenu',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = async (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    try {
      const map = commandHandler.commands;
      const total = map && map.size ? map.size : 1189;
      const prefix = (settings.prefixes && settings.prefixes[0]) || '.';
      const bot = settings.botName || 'QUEEN AKUMA';
      const owner = settings.botOwner || 'Owner';

      // Group commands by category
      const cats = {};
      if (map) {
        for (const [name, cmd] of map.entries()) {
          if (!name || typeof name !== 'string') continue;
          const cat = (cmd && cmd.category) ? String(cmd.category).toUpperCase() : 'OTHER';
          if (!cats[cat]) cats[cat] = [];
          cats[cat].push(name);
        }
      }

      // Sort categories and commands
      const catNames = Object.keys(cats).sort();
      for (const c of catNames) cats[c].sort();

      const uptime = process.uptime();
      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);
      const up = h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;

      let body =
`╭═══ ${toBold(bot)} ═══⊷
┃❃╭──────────────
┃❃│ ${toSans('All Menu')}
┃❃│ ${toSans('Owner')} : ${toBold(owner)}
┃❃│ ${toSans('Prefix')} : ${prefix}
┃❃│ ${toSans('Commands')} : ${toBold(String(total))}
┃❃│ ${toSans('Uptime')} : ${up}
┃❃╰───────────────
╰═════════════════⊷
`;

      // Prefer important categories first
      const order = ['GENERAL', 'MAIN', 'GROUP', 'ADMIN', 'OWNER', 'DOWNLOAD', 'TOOLS', 'AI', 'FUN', 'PROTECTION', 'IMPORTED', 'OTHER'];
      const shown = new Set();

      for (const prefer of order) {
        const key = catNames.find(c => c === prefer || c.includes(prefer));
        if (!key || !cats[key] || !cats[key].length) continue;
        shown.add(key);
        const list = cats[key];
        body += `\n╭─❏ ${toSans(key)} ❏\n`;
        // chunk 4 per line
        for (let i = 0; i < list.length; i += 4) {
          const chunk = list.slice(i, i + 4).map(n => toBold(n)).join('  •  ');
          body += `│ ${chunk}\n`;
        }
        body += `╰─────────────────\n`;
      }

      // Remaining categories
      for (const key of catNames) {
        if (shown.has(key)) continue;
        const list = cats[key];
        if (!list || !list.length) continue;
        body += `\n╭─❏ ${toSans(key)} ❏\n`;
        for (let i = 0; i < Math.min(list.length, 40); i += 4) {
          const chunk = list.slice(i, i + 4).map(n => toBold(n)).join('  •  ');
          body += `│ ${chunk}\n`;
        }
        if (list.length > 40) body += `│ ... +${list.length - 40} more\n`;
        body += `╰─────────────────\n`;
      }

      body += `\n📌 Type *${prefix}menu* for short menu\n📌 Type *${prefix}help <cmd>* for details\n`;

      // WhatsApp message limit ~4096, split if needed
      if (body.length > 3500) {
        const parts = [];
        let current = '';
        for (const line of body.split('\n')) {
          if ((current + line + '\n').length > 3400) {
            parts.push(current);
            current = line + '\n';
          } else {
            current += line + '\n';
          }
        }
        if (current) parts.push(current);
        for (const p of parts) {
          await sock.sendMessage(chatId, { text: p }, { quoted: message });
        }
      } else {
        await reply(body);
      }
    } catch (e) {
      console.error('[allmenu]', e);
      await reply('❌ allmenu error: ' + (e.message || e));
    }
  }
};
