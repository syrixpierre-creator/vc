/**
 * QUEEN AKUMA — menu (style "ancienne version" : header box + catégories
 * ╭───『 ᴄᴀᴛᴇɢᴏʀʏ 』 │ ▢ cmd ╰───◇ + image + boutons + myquoted + newsletter).
 * Catégories générées dynamiquement depuis les commandes chargées.
 */
const os = require('os');
const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');
const { fakevCard } = require('../lib/fakevCard');
const { botImageBuffer } = require('../lib/botImage');

// ── tiny caps (ᴀʙᴄ) pour les titres, comme l'ancien menu ──
const SMALL = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ꞯ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' };
const tiny = (t) => String(t).toLowerCase().split('').map(c => SMALL[c] || c).join('');

function uptimeStr() {
  const u = Math.floor(process.uptime());
  const h = Math.floor(u / 3600), m = Math.floor((u % 3600) / 60), s = u % 60;
  return `${h}h ${m}m ${s}s`;
}

function buildMenu(prefix, senderNum, total) {
  const used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const tot = Math.round(os.totalmem() / 1024 / 1024);

  // Grouper les commandes par catégorie
  const cats = {};
  const seen = new Set();
  for (const [name, cmd] of commandHandler.commands) {
    if (!cmd || cmd.__wrapper || cmd.__stub) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    const cat = (cmd.category || 'misc').toString().toUpperCase();
    (cats[cat] = cats[cat] || []).push(name);
  }

  let txt = `
╭─────────────❖
│ ✧ Bot Name : ${settings.botName}
│ ✧ User : @${senderNum}
│ ✧ Uptime : ${uptimeStr()}
│ ✧ Memory : ${used}MB / ${tot}MB
│ ✧ Commands : ${total}
│ ✧ Dev : ${settings.botOwner}
╰────────────❖

Ξ Select a category below:
`;

  // Categories in ascending order: fewest commands first (ties A→Z).
  const order = Object.keys(cats).sort((a, b) => (cats[a].length - cats[b].length) || a.localeCompare(b));
  for (const cat of order) {
    const list = cats[cat].sort();
    txt += `\n╭───『 ${tiny('akuma ' + cat)} 』\n`;
    for (const c of list) txt += `│ ▢ ${c}\n`;
    txt += `╰───────────◇\n`;
  }

  txt += `\n> © ${tiny('made by')} ${settings.botOwner}\n`;
  return txt;
}

function menuButtons(prefix) {
  return [
    { buttonId: `${prefix}alive`, buttonText: { displayText: '💓 Alive' }, type: 1 },
    { buttonId: `${prefix}ping`, buttonText: { displayText: '📈 Ping' }, type: 1 },
    { buttonId: `${prefix}owner`, buttonText: { displayText: '👑 Owner' }, type: 1 },
    { buttonId: `${prefix}menu`, buttonText: { displayText: '🗂️ Menu' }, type: 1 },
  ];
}

module.exports = {
  command: 'menu',
  aliases: [],
  category: 'general',
  description: 'Show the command menu',
  usage: '.menu',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid || '';
    const senderNum = String(sender).split('@')[0].split(':')[0];
    const prefix = (settings.prefixes && settings.prefixes[0]) || '.';
    const total = [...((commandHandler.commands && commandHandler.commands.values()) || [])].filter((c) => c && !c.__wrapper && !c.__stub).length;

    try { await sock.sendMessage(chatId, { react: { text: '📜', key: message.key } }); } catch (_) {}

    const caption = buildMenu(prefix, senderNum, total);
    const contextInfo = {
      mentionedJid: [sender],
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: settings.channelId,
        newsletterName: settings.channelName,
        serverMessageId: -1,
      },
    };

    const img = botImageBuffer();
    try {
      await sock.sendMessage(chatId, {
        image: img || undefined,
        caption,
        buttons: menuButtons(prefix),
        headerType: img ? 4 : 1,
        contextInfo,
      }, { quoted: fakevCard });
    } catch (_) {
      // fallback texte si l'image/boutons échouent
      await sock.sendMessage(chatId, { text: caption, contextInfo }, { quoted: fakevCard });
    }
    try { await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } }); } catch (_) {}
  },
};
