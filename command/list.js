/*****************************************************************************
 * QUEEN AKUMA — .menu (FAST: text first, video non-blocking)
 *****************************************************************************/
const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');

let _menuCache = { t: 0, text: '' };
const CACHE_MS = 30000;

function formatTime() {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: settings.timeZone || 'Asia/Kolkata'
  });
}

const categoryRules = [
  ['🎯', 'MAIN', n => ['alive', 'ping', 'owner', 'menu', 'menu2', 'help', 'list', 'uptime', 'runtime', 'perf', 'echo', 'intro', 'updates', 'botstats', 'syshealth'].includes(n)],
  ['🧠', 'AI', n => /^(ai|gpt|bard|blackbox|bb|imagine|flux|dexbot|gemini)/i.test(n)],
  ['👮', 'ADMIN', n => /(kick|promote|demote|mute|unmute|warn|ban|unban|tagall|hidetag|antilink|antibad|antidelete|antifake|antitag|delete|welcome|goodbye|shield)/i.test(n)],
  ['👥', 'GROUP', n => /(group|gstatus|hidetag|tagall|setg)/i.test(n)],
  ['⬇️', 'DOWNLOAD', n => /(play|song|video|ytmp|tiktok|instagram|facebook|twitter|mediafire|terabox|spotify|download|yt)/i.test(n)],
  ['🔍', 'OSINT', n => /(osint|ipv|leak|pan|gst|pincode|ifsc|vehicle|challan|detect|numinfo)/i.test(n)],
  ['🛠️', 'TOOLS', n => /(sticker|toimg|translate|qr|weather|short|calc|tts)/i.test(n)],
  ['👑', 'OWNER', n => /(sudo|setvar|allvar|online|plugin|dexapi|restart|broadcast)/i.test(n)]
];

function buildStylishMenu(prefix) {
  const now = Date.now();
  if (_menuCache.text && now - _menuCache.t < CACHE_MS) return _menuCache.text;

  const map = commandHandler.commands;
  if (!map || !map.size) return '_Commands loading…_';

  const buckets = {};
  categoryRules.forEach(([, name]) => { buckets[name] = []; });
  buckets.OTHER = [];

  for (const cmd of map.values()) {
    const n = String(cmd.command || '').toLowerCase();
    let placed = false;
    for (const [emoji, name, test] of categoryRules) {
      if (test(n)) {
        buckets[name].push(n);
        placed = true;
        break;
      }
    }
    if (!placed) buckets.OTHER.push(n);
  }

  let out =
    `**\n` +
    `*  🎯 ${settings.botName || 'QUEEN AKUMA'}*\n` +
    `*  ⏰ ${formatTime()}*\n` +
    `*  📚 ${map.size} commands*\n` +
    `**\n\n`;

  for (const [emoji, name] of categoryRules.map(r => [r[0], r[1]])) {
    const list = (buckets[name] || []).sort();
    if (!list.length) continue;
    out += `* ${emoji} ${name} (${list.length})*\n`;
    // compact rows of 3
    for (let i = 0; i < list.length; i += 3) {
      const row = list.slice(i, i + 3).map(c => `\`${prefix}${c}\``).join(' ');
      out += `** ${row}\n`;
    }
    out += `**\n\n`;
  }

  out += `_Second style: \`${prefix}menu2\`_\n_Detail: \`${prefix}help\`_\n_Updates: \`${prefix}updates\`_`;
  if (out.length > 55000) out = out.slice(0, 54800) + '\n\n_…_';
  _menuCache = { t: now, text: out };
  return out;
}

function buildCaption(prefix) {
  return (
    `🎯 *${settings.botName || 'QUEEN AKUMA'}*\n` +
    `⚡ Fast menu · ${formatTime()}\n` +
    `\`${prefix}menu2\` second style · \`${prefix}help\``
  );
}

module.exports = {
  command: 'menulegacy',
  aliases: [],
  category: 'main',
  description: 'Fast full command menu + video',
  usage: '.menu',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const prefix = (settings.prefixes && settings.prefixes[0]) || '.';

    if (args[0]) {
      const name = args[0].toLowerCase().replace(/^\./, '');
      let cmd = commandHandler.commands.get(name);
      if (!cmd && commandHandler.aliases) {
        const real = commandHandler.aliases.get(name);
        if (real) cmd = commandHandler.commands.get(real);
      }
      if (!cmd) {
        return sock.sendMessage(chatId, { text: `❌ \`${name}\` nahi mila. \`${prefix}menu\`` }, { quoted: message });
      }
      return sock.sendMessage(chatId, {
        text: `*📖 ${prefix}${cmd.command}*\n${cmd.description || '—'}\nCategory: *${cmd.category || 'general'}*\nUsage: \`${cmd.usage || prefix + cmd.command}\``
      }, { quoted: message });
    }

    // 1) TEXT FIRST — fastest response
    const body = buildStylishMenu(prefix);
    await sock.sendMessage(chatId, { text: body }, { quoted: message });

    // 2) Video in background — never blocks menu text (cached Buffer = instant)
    const { resolveMediaFast } = require('../lib/mediaCache');
    const videoSrc = null; // menu: image uniquement, pas de vidéo
    const imageSrc = await resolveMediaFast(settings.menuImage || process.env.MENU_IMAGE);
    const caption = buildCaption(prefix);
    setImmediate(() => {
      if (videoSrc) {
        sock.sendMessage(chatId, {
          video: videoSrc,
          mimetype: 'video/mp4',
          caption
        }).catch(() => {
          if (imageSrc) sock.sendMessage(chatId, { image: imageSrc, caption }).catch(() => {});
        });
      } else if (imageSrc) {
        sock.sendMessage(chatId, { image: imageSrc, caption }).catch(() => {});
      }
    });
  }
};
