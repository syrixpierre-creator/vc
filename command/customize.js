/**
 * QUEEN AKUMA • .customize — bot customization (owner only).
 * .customize                  — current settings dikhao
 * .customize botname <name>   — bot ka naam badlo
 * .customize ownername <name> — owner ka naam badlo
 * .customize prefix <p>       — prefix badlo (jaise . ! /)
 * .customize packname <text>  — sticker pack naam
 * .customize author <text>    — sticker author naam
 * .customize menuimage <url>  — menu image URL
 * .customize channellink <url>— channel link
 * .customize reset             — sab default par wapas
 * Note: changes restart ke baad lagenge (.restart se restart karo).
 */
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const isOwnerOrSudo = require('../lib/isOwner');

const CUSTOM_FILE = path.join(process.cwd(), 'data', 'custom.json');
const IDENTITY_FILE = path.join(process.cwd(), 'data', 'identity.json');

function readJson(fp) {
  try { if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch {}
  return {};
}
function writeJson(fp, obj) {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
}

const KEYS = {
  botname: { file: 'identity', key: 'botName', label: 'Bot Name' },
  ownername: { file: 'identity', key: 'botOwner', label: 'Owner Name' },
  ownernumber: { file: 'identity', key: 'ownerNumber', label: 'Owner Number' },
  channellink: { file: 'identity', key: 'channelLink', label: 'Channel Link' },
  prefix: { file: 'custom', key: 'prefixes', label: 'Prefix', multi: true },
  packname: { file: 'custom', key: 'packname', label: 'Sticker Pack Name' },
  author: { file: 'custom', key: 'author', label: 'Sticker Author' },
  menuimage: { file: 'custom', key: 'menuImage', label: 'Menu Image URL' },
};

module.exports = {
  command: 'customize',
  aliases: ['custom', 'botsettings', 'settingsbot'],
  category: 'owner',
  description: 'Customize bot name, prefix, sticker pack, menu image (owner only)',
  usage: '.customize <key> <value> | .customize reset',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const senderId = message.key.participant || message.key.remoteJid;
    let allowed = message.key.fromMe;
    if (!allowed) { try { allowed = await isOwnerOrSudo(senderId, sock, chatId); } catch {} }
    if (!allowed) return reply('🚫 *You are not authorized to use this command!* command.');
    const custom = readJson(CUSTOM_FILE);
    const identity = readJson(IDENTITY_FILE);
    const eff = (k, def) => custom[k] ?? identity[k] ?? settings[k] ?? def;

    if (!args || !args.length) {
      return reply(`⚙️ *QUEEN AKUMA Customization*\n\n🤖 Bot Name: ${eff('botName', settings.botName)}\n👑 Owner: ${eff('botOwner', settings.botOwner)}\n📱 Owner Number: ${eff('ownerNumber', settings.ownerNumber)}\n🔤 Prefix: ${(eff('prefixes', settings.prefixes) || ['.']).join(' ')}\n🏷️ Sticker Pack: ${eff('packname', settings.packname)}\n✍️ Sticker Author: ${eff('author', settings.author)}\n🖼️ Menu Image: ${String(eff('menuImage', settings.menuImage) || '').slice(0, 60)}\n🔗 Channel: ${eff('channelLink', settings.channelLink)}\n\n*Badlo:*\n• .customize botname <name>\n• .customize prefix <symbol>\n• .customize packname <text>\n• .customize author <text>\n• .customize menuimage <url>\n• .customize channellink <url>\n• .customize reset\n\n⚠️ Changes restart ke baad lagenge.`);
    }
    const key = String(args[0]).toLowerCase();
    if (key === 'reset') {
      try { fs.unlinkSync(CUSTOM_FILE); } catch {}
      try { fs.unlinkSync(IDENTITY_FILE); } catch {}
      return reply('✅ Customization reset ho gayi (default settings). Restart ke baad lagegi.');
    }
    const def = KEYS[key];
    if (!def) {
      return reply(`❌ Unknown key: ${key}\n\nAvailable: botname, ownername, ownernumber, channellink, prefix, packname, author, menuimage\nExample: .customize botname QUEEN AKUMA`);
    }
    const value = args.slice(1).join(' ').trim();
    if (!value) return reply(`❌ Usage: .customize ${key} <value>`);
    if (def.file === 'identity') {
      identity[def.key] = value;
      writeJson(IDENTITY_FILE, identity);
    } else if (def.multi) {
      custom[def.key] = value.split(/\s+/).filter(Boolean);
      writeJson(CUSTOM_FILE, custom);
    } else {
      custom[def.key] = value;
      writeJson(CUSTOM_FILE, custom);
    }
    await reply(`✅ *${def.label} set to: ${value}*\nRestart the bot to apply (.restart).`);
  }
};
