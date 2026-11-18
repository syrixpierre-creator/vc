/*****************************************************************************
 * QUEEN AKUMA — OSINT command pack + owner access control
 *****************************************************************************/
const osint = require('../lib/osintHub');
const osintAccess = require('../lib/osintAccess');
const isOwnerFn = require('../lib/isOwner');
const settings = require('../settings');

function senderOf(message) {
  return message.key.participant || message.key.remoteJid;
}

function isOwnerMsg(message) {
  if (message.key.fromMe) return true;
  const sender = senderOf(message);
  try {
    if (isOwnerFn.isOwnerOnly && isOwnerFn.isOwnerOnly(sender)) return true;
  } catch (_) {}
  return osintAccess.isOwnerJid(sender);
}

async function denyOsint(sock, chatId, message) {
  const st = osintAccess.load();
  if (!st.enabled) {
    return sock.sendMessage(
      chatId,
      {
        text: '🔒 *OSINT OFF* hai.\nOwner: `.osintaccess on`'
      },
      { quoted: message }
    );
  }
  return sock.sendMessage(
    chatId,
    {
      text:
        '🚫 *OSINT access nahi hai.*\n' +
        'Sirf *Owner* ya allowed users.\n\n' +
        '_Owner:_ `.osintaccess add 91xxxxxxxxxx` / @user'
    },
    { quoted: message }
  );
}

function makeHandler(cmdKey) {
  return async function handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = senderOf(message);
    if (!osintAccess.isAllowed(sender, message.key.fromMe)) {
      return denyOsint(sock, chatId, message);
    }
    const query = (args || []).join(' ').trim();
    try {
      if (!query) {
        const meta = osint.COMMANDS[cmdKey];
        return sock.sendMessage(
          chatId,
          {
            text:
              `🔍 *${meta.desc}*\n\n` +
              `Usage: \`.${cmdKey} <${meta.param}>\`\n` +
              `Example: \`.${cmdKey} ${meta.ex || ''}\``
          },
          { quoted: message }
        );
      }
      await sock
        .sendMessage(chatId, { text: `⏳ *${osint.COMMANDS[cmdKey].desc}*…` }, { quoted: message })
        .catch(() => {});
      const data = await osint.callApi(cmdKey, query);
      let text = osint.formatResult(data);
      if (text.length > 3500) text = text.slice(0, 3400) + '\n\n_…truncated_';
      return sock.sendMessage(
        chatId,
        { text: `✅ *${cmdKey}*\nQuery: \`${query}\`\n\n\`\`\`json\n${text}\n\`\`\`` },
        { quoted: message }
      );
    } catch (e) {
      return sock.sendMessage(chatId, { text: `❌ *${cmdKey}*: ${e.message}` }, { quoted: message });
    }
  };
}

const commands = [];

for (const [name, meta] of Object.entries(osint.COMMANDS)) {
  commands.push({
    command: name,
    aliases: meta.aliases || [],
    category: 'osint',
    description: meta.desc + ' (OSINT Hub)',
    usage: `.${name} <${meta.param}>`,
    cooldown: 800,
    handler: makeHandler(name)
  });
}

commands.push({
  command: 'osint',
  aliases: ['os', 'osinthub'],
  category: 'osint',
  description: 'OSINT hub router — .osint <cmd> <query>',
  usage: '.osint ipv1 8.8.8.8',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!osintAccess.isAllowed(senderOf(message), message.key.fromMe)) {
      return denyOsint(sock, chatId, message);
    }
    if (!args.length) {
      return sock.sendMessage(chatId, { text: osint.menuText() }, { quoted: message });
    }
    const key = osint.resolveAlias(args[0]);
    if (!key) {
      return sock.sendMessage(
        chatId,
        { text: `❌ Unknown: ${args[0]}\nTry \`.osintmenu\` or \`.osintsearch ${args[0]}\`` },
        { quoted: message }
      );
    }
    const query = args.slice(1).join(' ').trim();
    return makeHandler(key)(sock, message, query ? query.split(/\s+/) : [], context);
  }
});

commands.push({
  command: 'osintmenu',
  aliases: ['osmenu', 'osinthelp'],
  category: 'osint',
  description: 'OSINT category menu',
  usage: '.osintmenu | .osintmenu network',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!osintAccess.isAllowed(senderOf(message), message.key.fromMe)) {
      return denyOsint(sock, chatId, message);
    }
    return sock.sendMessage(chatId, { text: osint.menuText(args[0]) }, { quoted: message });
  }
});

commands.push({
  command: 'osintsearch',
  aliases: ['ossearch'],
  category: 'osint',
  description: 'Search OSINT commands',
  usage: '.osintsearch pan',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!osintAccess.isAllowed(senderOf(message), message.key.fromMe)) {
      return denyOsint(sock, chatId, message);
    }
    const q = args.join(' ').trim();
    if (!q) {
      return sock.sendMessage(chatId, { text: 'Usage: `.osintsearch <keyword>`' }, { quoted: message });
    }
    const hits = osint.searchCommands(q);
    if (!hits.length) {
      return sock.sendMessage(chatId, { text: `🔍 No OSINT cmds for *${q}*` }, { quoted: message });
    }
    let m = `🔍 *OSINT search: ${q}* (${hits.length})\n\n`;
    hits.forEach(([n, c]) => {
      m += `${osint.CATS[c.cat]?.icon || '•'} \`.${n}\` — ${c.desc}\n`;
    });
    return sock.sendMessage(chatId, { text: m }, { quoted: message });
  }
});

commands.push({
  command: 'detect',
  aliases: ['autodetect', 'whatis'],
  category: 'osint',
  description: 'Auto-detect value type → suggest OSINT cmds',
  usage: '.detect 8.8.8.8',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!osintAccess.isAllowed(senderOf(message), message.key.fromMe)) {
      return denyOsint(sock, chatId, message);
    }
    const q = args.join(' ').trim();
    if (!q) {
      return sock.sendMessage(chatId, { text: 'Usage: `.detect <ip|phone|pan|gst|url|…>`' }, { quoted: message });
    }
    const hits = osint.detectValue(q);
    if (!hits.length) {
      return sock.sendMessage(chatId, { text: `🤷 No match for \`${q}\`` }, { quoted: message });
    }
    let m = `🧠 *Detected:* \`${q}\`\n\n`;
    hits.forEach((k) => {
      const c = osint.COMMANDS[k];
      if (c) m += `${osint.CATS[c.cat]?.icon || '•'} \`.${k}\` — ${c.desc}\n`;
    });
    return sock.sendMessage(chatId, { text: m }, { quoted: message });
  }
});

commands.push({
  command: 'osintaccess',
  aliases: ['osaccess', 'osintperm', 'osintauth'],
  category: 'owner',
  description: 'OSINT on/off + allow users (owner only)',
  usage: '.osintaccess on|off|add|del|list',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!isOwnerMsg(message)) {
      return sock.sendMessage(chatId, { text: '❌ Sirf *owner* OSINT access manage kar sakta hai.' }, { quoted: message });
    }
    const sub = String(args[0] || '').toLowerCase();
    const rest = args.slice(1);

    if (!sub || sub === 'status' || sub === 'help') {
      const st = osintAccess.load();
      const list = st.users.length
        ? st.users.map((u, i) => `${i + 1}. ${u}`).join('\n')
        : '_koi extra user nahi_';
      return sock.sendMessage(
        chatId,
        {
          text:
            `🔐 *OSINT ACCESS*\n\n` +
            `System: *${st.enabled ? 'ON' : 'OFF'}*\n` +
            `Allowed users: *${st.users.length}*\n${list}\n\n` +
            `• \`.osintaccess on\` / \`.osintaccess off\`\n` +
            `• \`.osintaccess add 91xxxxxxxxxx\` / @user / reply\n` +
            `• \`.osintaccess del 91xxxxxxxxxx\`\n` +
            `• \`.osintaccess list\`\n\n` +
            `_Owner hamesha allowed._`
        },
        { quoted: message }
      );
    }

    if (sub === 'on') {
      osintAccess.setEnabled(true);
      return sock.sendMessage(chatId, { text: '✅ *OSINT ON* — owner + allowed users.' }, { quoted: message });
    }
    if (sub === 'off') {
      osintAccess.setEnabled(false);
      return sock.sendMessage(chatId, { text: '🔒 *OSINT OFF* — non-owner block. Owner still chal sakta hai.' }, { quoted: message });
    }
    if (sub === 'list') {
      const users = osintAccess.listUsers();
      const text = users.length ? users.map((u, i) => `${i + 1}. ${u}`).join('\n') : '_empty_';
      return sock.sendMessage(chatId, { text: `👥 *OSINT allowed*\n\n${text}` }, { quoted: message });
    }
    if (sub === 'add' || sub === 'set') {
      let target =
        message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
        message.message?.extendedTextMessage?.contextInfo?.participant ||
        rest.join(' ').trim();
      if (!target) {
        return sock.sendMessage(
          chatId,
          {
            text:
              'Usage:\n`.osintaccess add 9198xxxxxxxx`\n`.osintaccess add @user`\nReply + `.osintaccess add`'
          },
          { quoted: message }
        );
      }
      const r = osintAccess.addUser(target);
      if (!r.ok) return sock.sendMessage(chatId, { text: '❌ ' + r.error }, { quoted: message });
      return sock.sendMessage(
        chatId,
        {
          text: `✅ OSINT access *add*:\n\`${osintAccess.normEntry(target)}\`\nTotal: *${r.users.length}*`
        },
        { quoted: message }
      );
    }
    if (sub === 'del' || sub === 'remove' || sub === 'rm') {
      let target =
        message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
        message.message?.extendedTextMessage?.contextInfo?.participant ||
        rest.join(' ').trim();
      if (!target) {
        return sock.sendMessage(chatId, { text: 'Usage: `.osintaccess del 91xxxxxxxxxx`' }, { quoted: message });
      }
      const r = osintAccess.removeUser(target);
      return sock.sendMessage(
        chatId,
        {
          text: `✅ Access *remove*: \`${osintAccess.normEntry(target)}\`\nTotal: *${r.users.length}*`
        },
        { quoted: message }
      );
    }
    return sock.sendMessage(chatId, { text: 'Usage: `.osintaccess on|off|add|del|list|status`' }, { quoted: message });
  }
});

module.exports = { commands };
