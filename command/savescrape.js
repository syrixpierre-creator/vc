/**
 * QUEEN AKUMA • .savescrape — quoted code ko lib/scrape/<name>.js me save karo.
 * 1520 plugins se port (owner only). Code save karne se pehle syntax-error
 * se check hota hai, galat code save nahi hota.
 */
const fs = require('fs');
const path = require('path');
const syntaxError = require('syntax-error');
const isOwnerOrSudo = require('../lib/isOwner');

module.exports = {
  command: 'savescrape',
  aliases: ['savescraper', 'savesc'],
  category: 'owner',
  description: 'Save quoted code as a scraper file (owner only)',
  usage: '.savescrape <name> (reply to code)',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const senderId = message.key.participant || message.key.remoteJid;
    let allowed = message.key.fromMe;
    if (!allowed) { try { allowed = await isOwnerOrSudo(senderId, sock, chatId); } catch {} }
    if (!allowed) return reply('🚫 *You are not authorized to use this command!* command.');
    const name = String((args && args[0]) || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (!name) return reply('❌ Usage: .savescrape <name>\nExample: .savescrape y2mate (reply to code)');
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const code = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
    if (!code) return reply('📌 *Usage:* reply to a code message');
    const err = syntaxError(code, name + '.js', { sourceType: 'module', allowAwaitOutsideFunction: true });
    if (err) return reply('❌ *Syntax error, not saved:*\n' + String(err.message).slice(0, 800));
    const dir = path.join(process.cwd(), 'lib', 'scrape');
    fs.mkdirSync(dir, { recursive: true });
    const fp = path.join(dir, name + '.js');
    fs.writeFileSync(fp, code);
    await reply(`✅ Scraper saved!\n\n📁 lib/scrape/${name}.js\nImport: require('./lib/scrape/${name}')`);
  }
};
