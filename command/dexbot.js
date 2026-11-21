const dex = require('../lib/dexbot');
const isOwnerFn = require('../lib/isOwner');
const settings = require('../settings');

function isOwner(m, sock, chatId) {
  if (m.key.fromMe) return true;
  const sender = m.key.participant || m.key.remoteJid;
  try {
    if (isOwnerFn.isOwnerOnly && isOwnerFn.isOwnerOnly(sender)) return true;
  } catch {}
  const o = String(settings.ownerNumber || '').replace(/\D/g, '');
  const s = String(sender || '').replace(/\D/g, '');
  return !!(o && s && s.includes(o));
}

function statusText() {
  const d = dex.load();
  const key = dex.getGeminiKey();
  return (
    ` *DEXBOT AI* \n` +
    ` Status: ${d.enabled ? '✅ ON' : '❌ OFF'}\n` +
    ` DM: ${d.dm ? '✅' : '❌'} | Group: ${d.group ? '✅' : '❌'}\n` +
    ` Bot: *${d.botName}*\n` +
    ` Owner: *${d.ownerName}*\n` +
    ` Developer: *${d.developerName}*\n` +
    ` Gemini key: ${key ? '✅ set' : '❌ missing'}\n` +
    ` Elite API: ✅ auto (eliteprotech-apis)\n` +
    `\n\n` +
    `*Power*\n` +
    `• \`.dexbot on\` / \`.dexbot off\`\n` +
    `• \`.dexbot dm on|off\`\n` +
    `• \`.dexbot group on|off\`\n` +
    `• \`.dexbot both on\` — DM+Group\n\n` +
    `*Customise*\n` +
    `• \`.dexbot set owner <name>\`\n` +
    `• \`.dexbot set developer <name>\`\n` +
    `• \`.dexbot set botname <name>\`\n` +
    `• \`.dexbot set hello <message>\`\n` +
    `• \`.dexbot set prompt <system prompt>\`\n\n` +
    `*AI*\n` +
    `• \`.dexbot ask <question>\`\n\n` +
    `_AI order: EliteProTech → API switch → Gemini key_\n` +
    `_Key optional: config.js / .env GEMINI_API_KEY_`
  );
}

module.exports = {
  command: 'dexbot',
  aliases: ['aiassistant', 'gemini', 'botai'],
  category: 'owner',
  description: 'Gemini AI assistant — DM/Group on-off + custom hello/owner info',
  usage: '.dexbot on|off|dm|group|set|ask|status',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const owner = isOwner(message, sock, chatId);
    const sub = String(args[0] || '').toLowerCase();
    const rest = args.slice(1);

    if (!sub || sub === 'status' || sub === 'help') {
      return sock.sendMessage(chatId, { text: statusText() }, { quoted: message });
    }

    // ask is allowed for anyone if bot enabled in that chat type
    if (sub === 'ask') {
      const q = rest.join(' ').trim();
      if (!q) return sock.sendMessage(chatId, { text: 'Usage: `.dexbot ask <question>`' }, { quoted: message });
      const isGroup = chatId.endsWith('@g.us');
      if (!dex.shouldReply(chatId, isGroup) && !owner) {
        return sock.sendMessage(chatId, { text: '❌ *Dexbot is OFF here.*' }, { quoted: message });
      }
      await sock.sendMessage(chatId, { text: '⏳ Thinking…' }, { quoted: message }).catch(() => {});
      const ai = await dex.askGemini(q);
      if (!ai.ok) return sock.sendMessage(chatId, { text: '⚠️ ' + ai.error }, { quoted: message });
      return sock.sendMessage(chatId, { text: ai.text }, { quoted: message });
    }

    if (!owner) {
      return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
    }

    if (sub === 'on') {
      dex.set('enabled', true);
      return sock.sendMessage(chatId, { text: '✅ *Dexbot ON*\nAb DM/Group flags ke hisaab se reply karega.\n' + statusText() }, { quoted: message });
    }
    if (sub === 'off') {
      dex.set('enabled', false);
      return sock.sendMessage(chatId, { text: '❌ *Dexbot OFF*' }, { quoted: message });
    }
    if (sub === 'both') {
      const v = String(rest[0] || 'on').toLowerCase() !== 'off';
      dex.set('enabled', true);
      dex.set('dm', v);
      dex.set('group', v);
      return sock.sendMessage(chatId, { text: `✅ Dexbot both DM+Group: *${v ? 'ON' : 'OFF'}*` }, { quoted: message });
    }
    if (sub === 'dm') {
      const v = String(rest[0] || '').toLowerCase();
      if (v !== 'on' && v !== 'off') {
        return sock.sendMessage(chatId, { text: 'Usage: `.dexbot dm on` / `.dexbot dm off`' }, { quoted: message });
      }
      dex.set('dm', v === 'on');
      if (v === 'on') dex.set('enabled', true);
      return sock.sendMessage(chatId, { text: `✅ Dexbot *DM* ${v.toUpperCase()}` }, { quoted: message });
    }
    if (sub === 'group' || sub === 'gc') {
      const v = String(rest[0] || '').toLowerCase();
      if (v !== 'on' && v !== 'off') {
        return sock.sendMessage(chatId, { text: 'Usage: `.dexbot group on` / `.dexbot group off`' }, { quoted: message });
      }
      dex.set('group', v === 'on');
      if (v === 'on') dex.set('enabled', true);
      return sock.sendMessage(chatId, { text: `✅ Dexbot *Group* ${v.toUpperCase()}` }, { quoted: message });
    }
    if (sub === 'set') {
      const key = String(rest[0] || '').toLowerCase();
      const val = rest.slice(1).join(' ').trim();
      const map = {
        owner: 'ownerName',
        developer: 'developerName',
        dev: 'developerName',
        botname: 'botName',
        bot: 'botName',
        hello: 'helloMessage',
        hi: 'helloMessage',
        prompt: 'systemPrompt',
        system: 'systemPrompt'
      };
      if (!map[key] || !val) {
        return sock.sendMessage(chatId, {
          text:
            'Usage:\n' +
            '`.dexbot set owner INCONNU BOY SENSEI`\n' +
            '`.dexbot set developer YourName`\n' +
            '`.dexbot set botname QUEEN AKUMA`\n' +
            '`.dexbot set hello Namaste! Kaise ho?`\n' +
            '`.dexbot set prompt You are a helpful bot...`'
        }, { quoted: message });
      }
      dex.set(map[key], val);
      return sock.sendMessage(chatId, { text: `✅ *${map[key]}* update:\n${val}` }, { quoted: message });
    }

    return sock.sendMessage(chatId, { text: statusText() }, { quoted: message });
  }
};
