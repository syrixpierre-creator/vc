/**
 * QUEEN AKUMA v2.8.0 - QUEEN AKUMA port: status automation + group status posting
 * FEI commands/status-automation.js, commands/gcstatus.js aur
 * commands/gcstatus-dm.js ka CJS port (QUEEN AKUMA dispatcher ke liye).
 * Audience name rebrand: "Benfei Tech" -> "INCONNU BOY SENSEI".
 * Sab commands owner-only. gcstatus sirf group me, gcstatusdm sirf DM me.
 */
const gs = require('../lib/feiGroupStatus');
const autoStatus = require('./autostatus');

const DEFAULT_REACT_EMOJIS = ['❤️', '🔥', '💯', '👍', '😂', '😮', '😢', '🙏'];

function isPictographic(value) {
  try {
    return typeof value === 'string' && /\p{Extended_Pictographic}/u.test(value);
  } catch (_) {
    return typeof value === 'string' && value.length > 0;
  }
}

function parseEmojiList(raw) {
  const list = String(raw || '').split(',').map(s => s.trim()).filter(Boolean);
  const unique = [...new Set(list)];
  if (unique.length > 12) return { emojis: null, error: 'Max 12 emojis.' };
  if (unique.some(e => [...e].length > 8 || !isPictographic(e))) {
    return { emojis: null, error: 'Use valid emojis only.' };
  }
  return { emojis: unique, error: '' };
}

function make(cmd, aliases, desc, usage, handler, extra) {
  const base = {
    command: cmd,
    aliases: aliases || [],
    category: 'fei-status',
    description: desc,
    usage: usage || ('.' + cmd),
    handler: async (sock, message, args, context) => {
      const chatId = (context && context.chatId) || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const input = Array.isArray(args) ? args.join(' ').trim() : '';
      try {
        await handler(sock, chatId, message, input, args, reply, context);
      } catch (err) {
        console.error('fei-status.' + cmd, err && err.message);
        await reply('❌ ' + (err && err.message ? String(err.message).slice(0, 300) : 'Something went wrong.'));
      }
    }
  };
  return Object.assign(base, extra || {});
}

const statusCommands = [
  make('statusreactmode', [], 'Set the status react emoji mode (random or list)', '.statusreactmode random | ❤️,🔥,💯', async (sock, chatId, message, input, args, reply) => {
    const config = await autoStatus.readConfig();
    if (!input) {
      const current = config.reactMode === 'random' ? 'random'
        : Array.isArray(config.reactMode) ? config.reactMode.join(' ') : 'default';
      return reply('👍 *STATUS REACT MODE*\n\nCurrent: ' + current + '\n\nUsage:\n• `.statusreactmode random` — har status par random emoji\n• `.statusreactmode ❤️,🔥,💯` — in emojis me se random');
    }
    if (input.toLowerCase() === 'random') {
      config.reactMode = 'random';
      await autoStatus.writeConfig(config);
      return reply('✅ Status react mode: *random* (' + DEFAULT_REACT_EMOJIS.join(' ') + ')');
    }
    const { emojis, error } = parseEmojiList(input);
    if (error) return reply('❌ ' + error);
    config.reactMode = emojis;
    await autoStatus.writeConfig(config);
    return reply('✅ Status react mode set: ' + emojis.join(' ') + '');
  }, { ownerOnly: true }),

  make('statusreactkeys', [], 'React only to statuses with these keywords', '.statusreactkeys happy,birthday | clear', async (sock, chatId, message, input, args, reply) => {
    const config = await autoStatus.readConfig();
    if (!input) {
      const keys = Array.isArray(config.reactKeys) ? config.reactKeys : [];
      return reply('🔑 *STATUS REACT KEYS*\n\nCurrent: ' + (keys.length ? keys.join(', ') : 'none — har status par react') + '\n\nUsage:\n• `.statusreactkeys happy,birthday`\n• `.statusreactkeys clear`');
    }
    if (input.toLowerCase() === 'clear') {
      config.reactKeys = [];
      await autoStatus.writeConfig(config);
      return reply('✅ *Keywords cleared.*');
    }
    const keywords = input.split(',').map(s => s.trim()).filter(Boolean);
    if (keywords.length > 20) return reply('❌ Max 20 keywords.');
    if (keywords.some(k => k.length > 60)) return reply('❌ Har keyword 60 characters tak.');
    config.reactKeys = keywords;
    await autoStatus.writeConfig(config);
    return reply('✅ Status react keywords set: ' + keywords.join(', ') + '');
  }, { ownerOnly: true }),

  make('gcstatus', [], 'Is group par group status post karo (text ya reply media)', '.gcstatus [--color <name>] <text>', async (sock, chatId, message, input, args, reply) => {
    const colorOption = gs.parseGroupStatusColor(input);
    if (colorOption.error) return reply('❌ ' + colorOption.error);
    const ctx = {
      sock,
      msg: message,
      jid: chatId,
      sessionId: (sock.user && (sock.user.id || sock.user.lid)) || ''
    };
    const posted = await gs.postQuotedGroupStatus(ctx, chatId, colorOption.text, colorOption);
    const label = posted.kind === 'text' ? 'text status' : posted.kind + ' status';
    await reply('✅ *GROUP STATUS POSTED* (' + label + ')' +
      (posted.color ? '\n🎨 Background: ' + posted.color.name + ' (' + posted.color.hex + ')' : ''));
  }, { ownerOnly: true, groupOnly: true }),

  make('gcstatusdm', [], 'Post a group status from DM', '.gcstatusdm list | colors | <number/JID> <text>', async (sock, chatId, message, input, args, reply) => {
    if (!input) {
      return reply('❌ *Invalid option!*\n\nAvailable options:\n- list\n- colors\n- <number or JID> <text>');
    }
    const lower = input.toLowerCase();
    if (lower === 'colors') {
      return reply('🎨 *GROUP STATUS COLORS*\n\n' + gs.listGroupStatusColors() + '\n\n_Usage: `.gcstatusdm <number> --color purple <text>`_');
    }
    if (lower === 'list' || lower.startsWith('list ')) {
      const pageArg = lower === 'list' ? 1 : Number.parseInt(input.split(/\s+/)[1], 10);
      const page = Number.isFinite(pageArg) && pageArg > 0 ? pageArg : 1;
      if (typeof sock.groupFetchAllParticipating !== 'function') {
        return reply('❌ *Cannot get the group list.*');
      }
      const groups = Object.values(await sock.groupFetchAllParticipating());
      groups.sort((a, b) => String(a.subject || '').localeCompare(String(b.subject || '')));
      const totalPages = Math.max(1, Math.ceil(groups.length / 20));
      const start = (page - 1) * 20;
      const slice = groups.slice(start, start + 20);
      if (!slice.length) return reply('❌ Page ' + page + ' khaali hai. Total pages: ' + totalPages + '.');
      const lines = slice.map((g, i) => (start + i + 1) + '. ' + (g.subject || 'Unnamed group') + '\n   🆔 ' + g.id);
      return reply('👥 *GROUPS — Page ' + page + '/' + totalPages + ' (' + groups.length + ')*\n\n' + lines.join('\n') + '\n\n_Usage: `.gcstatusdm <number ya JID> <text>`_');
    }
    const tokens = input.split(/\s+/);
    const targetToken = tokens[0] || '';
    const rest = tokens.slice(1).join(' ');
    let targetId = '';
    if (/^\d+@g\.us$/i.test(targetToken)) {
      targetId = targetToken;
    } else {
      const digits = targetToken.replace(/\D/g, '');
      if (!digits || digits.length < 5) return reply('❌ Usage: `.gcstatusdm <number ya JID> <text>`');
      targetId = digits + '@g.us';
    }
    if (typeof sock.groupFetchAllParticipating !== 'function') {
      return reply('❌ *Cannot verify the group.*');
    }
    const groups = await sock.groupFetchAllParticipating();
    const target = groups[targetId];
    if (!target) return reply('❌ *Group not found:* ' + targetId + '\n\nThe bot must be in that group (.gcstatusdm list).');
    const colorOption = gs.parseGroupStatusColor(rest);
    if (colorOption.error) return reply('❌ ' + colorOption.error);
    const ctx = {
      sock,
      msg: message,
      jid: chatId,
      sessionId: (sock.user && (sock.user.id || sock.user.lid)) || ''
    };
    const posted = await gs.postQuotedGroupStatus(ctx, targetId, colorOption.text, colorOption);
    const label = posted.kind === 'text' ? 'text status' : posted.kind + ' status';
    await reply('✅ *GROUP STATUS POSTED* — ' + (target.subject || targetId) + ' (' + label + ')' +
      (posted.color ? '\n🎨 Background: ' + posted.color.name + ' (' + posted.color.hex + ')' : ''));
  }, { ownerOnly: true }),
];

module.exports = { commands: [...statusCommands] };
