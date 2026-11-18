/**
 * QUEEN AKUMA v3.0.0 — .store : Plugin Store (owner-only)
 * .store — catalog + installed list
 * .store install <name|url> — GitHub se plugin install + hot-load
 * .store remove <name> — plugin hatao
 */
const ps = require('../lib/pluginStore');
const isOwnerOrSudo = require('../lib/isOwner');

module.exports = {
  command: 'store',
  aliases: ['pluginstore'],
  category: 'owner',
  description: 'Plugin Store — WhatsApp se plugins install karo',
  usage: '.store | .store install <name> | .store remove <name>',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderJid = message.key.participant || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const isOwner = message.key.fromMe || isOwnerOrSudo.isOwnerOnly(senderJid) || await isOwnerOrSudo(senderJid, sock, chatId);
    if (!isOwner) return reply('🚫 *You are not authorized to use this command!*');
    const sub = (args[0] || '').toLowerCase();
    const rest = (args[1] || '').trim();

    if (sub === 'install') {
      if (!rest) return reply('❌ Usage: `.store install motivate`\nYa: `.store install https://raw.githubusercontent.com/.../plugin.js`');
      await reply('📥 *Plugin install ho raha hai...*');
      const r = await ps.install(rest);
      if (!r.ok) return reply('❌ Install fail:\n' + r.error);
      return reply(`✅ *Plugin install ho gaya!*\n\n📦 ${r.name} → \`${r.file}\`\nAbhi use karo: try karo uska command.\nHataane ke liye: \`.store remove ${r.name}\``);
    }
    if (sub === 'remove') {
      if (!rest) return reply('❌ Usage: `.store remove motivate`');
      const r = ps.remove(rest);
      if (!r.ok) return reply('❌ ' + r.error);
      return reply(`🗑️ Plugin *${r.name}* hata diya gaya.`);
    }
    const catalog = ps.getCatalog();
    const installed = ps.installedList();
    const list = catalog.map((c) => `${installed.includes(c.name) ? '✅' : '📦'} *${c.name}* — ${c.desc}`).join('\n');
    return reply(`🛒 *QUEEN AKUMA Plugin Store*\n\n${list}\n\n✅ = installed\n\nInstall: \`.store install <name>\`\nRemove: \`.store remove <name>\`\n\n⚠️ Catalog GitHub se download hota hai — bot ko apne GitHub repo (INCONNU-BOY-SENSEI/QUEEN-AKUMA) par push karo, tabhi install chalega. Apna plugin URL se bhi install kar sakte ho.`);
  }
};
