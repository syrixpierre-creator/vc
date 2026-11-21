/*****************************************************************************
 * QUEEN AKUMA — .menu2  (second menu style — fast & reliable)
 *****************************************************************************/
const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');
// v2.5.0 THEME: 👑 ROYAL — Bold text style + crown emojis (premium look)
const { allFonts, convertText } = require('../lib/fonts');
const BOLD = allFonts[0];      // Bold
const SCRIPT = allFonts[4];    // Script
const B = (t) => convertText(String(t), BOLD);
const S = (t) => convertText(String(t), SCRIPT);

function prefix() {
  return (settings.prefixes && settings.prefixes[0]) || '.';
}

const CATS = [
  { id: 'main', title: '🎯 MAIN', test: n => /^(alive|ping|menu|menu2|help|owner|uptime|intro|updates|botstats|syshealth|echo)/i.test(n) },
  { id: 'ai', title: '🧠 AI', test: n => /^(ai|gpt|blackbox|bb|dexbot|imagine|gemini)/i.test(n) },
  { id: 'admin', title: '👮 ADMIN', test: n => /(kick|promote|demote|mute|warn|ban|antilink|antidelete|welcome|goodbye|tagall|hidetag)/i.test(n) },
  { id: 'group', title: '👥 GROUP', test: n => /(gstatus|group|setg|linkgc|revoke)/i.test(n) },
  { id: 'download', title: '⬇️ DOWNLOAD', test: n => /(play|song|ytmp|tiktok|instagram|facebook|twitter|mediafire|terabox|spotify|video)/i.test(n) },
  { id: 'osint', title: '🔍 OSINT', test: n => /(osint|ipv|leak|pan|gst|pincode|ifsc|vehicle|detect|num)/i.test(n) },
  { id: 'tools', title: '🛠️ TOOLS', test: n => /(sticker|toimg|qr|tts|translate|weather|short)/i.test(n) },
  { id: 'owner', title: '👑 OWNER', test: n => /(sudo|setvar|allvar|online|plugin|dexapi|broadcast|restart)/i.test(n) },
  { id: 'fun', title: '🎮 FUN', test: n => /(joke|quote|meme|truth|dare|ship|couple)/i.test(n) }
];

function allCmds() {
  const map = commandHandler.commands;
  if (!map) return [];
  return [...map.keys()].map(String).sort();
}

function cmdsFor(catId) {
  const cat = CATS.find(c => c.id === catId);
  if (!cat) return [];
  return allCmds().filter(n => cat.test(n));
}

function styleHeader() {
  const bot = settings.botName || 'QUEEN AKUMA';
  // Live count (pehle hardcoded 2025 tha — ab loader ka asli count, classic/neon jaisa).
  const total = (commandHandler.commands && commandHandler.commands.size > 0) ? commandHandler.commands.size : 2025;
  return (
    `👑 ════ ${B('ROYAL MENU')} ════ 👑\n` +
    `✨ ${S(bot)} ✨\n` +
    `┃  ⚡ ${B('MENU 2')} — ${B('Category Style')}\n` +
    `┃  📚 ${B('Commands')}: *${total}*\n` +
    `┃  👤 ${settings.botOwner || 'INCONNU BOY SENSEI'}\n` +
    `┃  💎 ${B('Premium Theme')} • 👑 ${B('Royal')}\n` +
    `╚═══════════════════╝`
  );
}

async function sendCategoryHome(sock, chatId, message) {
  const p = prefix();
  let body = styleHeader() + '\n\n';
  body += `👑 ${B('CHOOSE A CATEGORY')} 👑\n\n`;
  CATS.forEach((c, i) => {
    const n = cmdsFor(c.id).length;
    body += `*${i + 1}.* ${c.title}  _(${n})_\n`;
    body += `    ↳ \`${p}menu2 ${c.id}\`\n\n`;
  });
  body += `━━━━━━━━━━━━━━━━\n`;
  body += `📖 Full list: \`${p}menu\`\n`;
  body += `🌟 Neon theme: \`${p}menu3\`\n`;
  body += `🎨 All themes: \`${p}menutheme\`\n`;
  body += `🔎 Detail: \`${p}help <cmd>\`\n`;
  body += `📢 Updates: \`${p}updates\``;

  await sock.sendMessage(chatId, { text: body }, { quoted: message });
}

async function sendCategory(sock, chatId, message, catId) {
  const p = prefix();
  const cat = CATS.find(c => c.id === catId);
  if (!cat) {
    return sock.sendMessage(chatId, { text: `❌ Unknown category.\n\`${p}menu2\`` }, { quoted: message });
  }
  const names = cmdsFor(catId);
  let text =
    `👑 ═══ ${B(cat.title)} ═══ 👑\n` +
    `┃ ${B('Total')}: *${names.length}*\n` +
    `╚═══════════════╝\n\n`;

  if (!names.length) {
    text += '_No commands in this category._';
  } else {
    // 2 per line
    for (let i = 0; i < names.length; i += 2) {
      const a = `\`${p}${names[i]}\``;
      const b = names[i + 1] ? `  \`${p}${names[i + 1]}\`` : '';
      text += `• ${a}${b}\n`;
    }
  }
  text += `\n↩️ \`${p}menu2\` categories`;

  // split if huge
  if (text.length < 4000) {
    return sock.sendMessage(chatId, { text }, { quoted: message });
  }
  const mid = Math.floor(names.length / 2);
  let t1 = `╔══ ${cat.title} (1/2) ══╗\n\n`;
  names.slice(0, mid).forEach(n => { t1 += `• \`${p}${n}\`\n`; });
  let t2 = `╔══ ${cat.title} (2/2) ══╗\n\n`;
  names.slice(mid).forEach(n => { t2 += `• \`${p}${n}\`\n`; });
  await sock.sendMessage(chatId, { text: t1 }, { quoted: message });
  await sock.sendMessage(chatId, { text: t2 });
}

module.exports = {
  command: 'menu2',
  aliases: ['listmenu', 'btnmenu', 'menulist2', 'help2', 'm2'],
  category: 'main',
  description: 'Second menu style — categories',
  usage: '.menu2 | .menu2 download',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sub = String(args[0] || '').toLowerCase().trim();

    if (!sub) {
      return sendCategoryHome(sock, chatId, message);
    }
    if (sub === 'full') {
      try {
        const list = require('./list');
        if (list.handler) return list.handler(sock, message, [], context);
      } catch (_) {}
      return sock.sendMessage(chatId, { text: 'Use `.menu`' }, { quoted: message });
    }
    return sendCategory(sock, chatId, message, sub);
  },

  async handleListSelection(sock, message, rowId) {
    const id = String(rowId || '').replace(/^menu2_/, '');
    const chatId = message.key.remoteJid;
    if (!id || id === 'home') {
      await sendCategoryHome(sock, chatId, message);
      return true;
    }
    if (id === 'full') {
      try {
        const list = require('./list');
        if (list.handler) await list.handler(sock, message, [], { chatId });
      } catch (_) {}
      return true;
    }
    await sendCategory(sock, chatId, message, id);
    return true;
  }
};
