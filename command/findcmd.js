/**
 * QUEEN AKUMA v3.5.0 • #37 .findcmd — 2,900+ commands me se koi bhi dhoondho (Flash Cmd.js se)
 * Usage: .findcmd <naam> — naam, alias, description, category, access, file location.
 * Registry: lib/commandHandler ka commands Map. File location: command/ dir scan.
 */
const fs = require('fs');
const path = require('path');

function findFileLocation(commandsDir, commandName) {
  const pattern = new RegExp(`command:\\s*['"](${commandName})['"]`, 'i');
  const walk = (dir) => {
    let files = [];
    try { files = fs.readdirSync(dir); } catch (_) { return null; }
    for (const f of files) {
      const fp = path.join(dir, f);
      let stat;
      try { stat = fs.statSync(fp); } catch (_) { continue; }
      if (stat.isDirectory()) {
        if (f === 'node_modules') continue;
        const r = walk(fp);
        if (r) return r;
      } else if (f.endsWith('.js')) {
        try {
          const content = fs.readFileSync(fp, 'utf8');
          if (pattern.test(content)) return path.relative(process.cwd(), fp);
        } catch (_) {}
      }
    }
    return null;
  };
  return walk(commandsDir);
}

module.exports = {
  command: 'findcmd',
  aliases: ['locate', 'where', 'cmdinfo', 'commandinfo'],
  category: 'main',
  description: 'Find any command — name, aliases, description, category, file location',
  usage: '.findcmd <command name>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const query = (args || []).join(' ').trim().toLowerCase();
    if (!query) {
      return reply('🔍 *Find Command*\n\nUsage: `.findcmd <naam>`\nExample: `.findcmd ludo` or `.findcmd sticker`');
    }
    let target = null; let targetName = null;
    try {
      const ch = require('../lib/commandHandler');
      for (const [name, cmd] of ch.commands) {
        const cname = String(cmd.command || cmd.name || name).toLowerCase();
        if (cname === query) { target = cmd; targetName = cname; break; }
        const als = (cmd.aliases || cmd.alias || []).map((a) => String(a).toLowerCase());
        if (als.includes(query)) { target = cmd; targetName = cname; break; }
      }
    } catch (_) {}
    if (!target) {
      return reply(`❌ *Command "${query}" not found.*`);
    }
    const commandsDir = path.join(process.cwd(), 'command');
    const fileLoc = findFileLocation(commandsDir, targetName) || 'Unknown';
    const aliases = (target.aliases || target.alias || []).join(', ');
    const lines = [
      '🔍 *Command Found*', '',
      `📌 Name: *${target.command || target.name || targetName}*`,
      aliases ? `🔗 Aliases: ${aliases}` : null,
      `📝 Description: ${target.description || target.desc || 'No description'}`,
      `📂 Category: ${target.category || 'General'}`,
      target.ownerOnly ? '🔒 Access: Owner only' : null,
      `📄 File: ${fileLoc}`,
    ].filter(Boolean).join('\n');
    return reply(lines);
  },
};
