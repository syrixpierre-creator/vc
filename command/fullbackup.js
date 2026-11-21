/**
 * QUEEN AKUMA v3.0.0 — .fullbackup : One-tap backup (owner-only, DM-only)
 * session/ + data/ + settings.js ka zip bana kar owner ko DM me bhejta hai.
 * .env include NAHI hota (tokens dobara daalne honge) — session creds.json
 * hi kaafi hai reconnect ke liye. Restore: zip extract karo, npm install,
 * node index.js — bas.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const isOwnerOrSudo = require('../lib/isOwner');

const BOT_ROOT = path.join(__dirname, '..');

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, timeout: 60000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stderr || err.message || '').trim()));
      resolve(stdout);
    });
  });
}

module.exports = {
  command: 'fullbackup',
  aliases: ['backupall'],
  category: 'owner',
  description: 'Poora bot backup (session + data + settings) zip karke DM me bhejo',
  usage: '.fullbackup',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderJid = message.key.participant || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const isOwner = message.key.fromMe || isOwnerOrSudo.isOwnerOnly(senderJid) || await isOwnerOrSudo(senderJid, sock, chatId);
    if (!isOwner) return reply('🚫 *You are not authorized to use this command!*');
    if (chatId.endsWith('@g.us')) return reply('🔒 *Use this command in DM.*');
    await reply('⏳ *Making backup...*');
    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
    const zipName = `QUEEN-AKUMA-backup-${stamp}.zip`;
    const tmpZip = path.join(os.tmpdir(), zipName);
    const restoreTxt = path.join(BOT_ROOT, 'RESTORE.txt');
    try {
      fs.writeFileSync(restoreTxt,
        'QUEEN AKUMA BACKUP — RESTORE STEPS\n' +
        '1. Zip extract karo, npm install --legacy-peer-deps chalao\n' +
        '2. Add GEMINI_API_KEY / GROQ_API_KEY / TELEGRAM_BOT_TOKEN again in .env (not in the backup)\n' +
        '3. Run the bot: it connects from session/creds.json\n');
      const targets = ['session', 'data', 'settings.js', 'RESTORE.txt'].filter((t) => fs.existsSync(path.join(BOT_ROOT, t)));
      if (!targets.length) return reply('❌ *Nothing to back up.*');
      try {
        await run('zip', ['-r', '-q', tmpZip, ...targets], BOT_ROOT);
      } catch (_) {
        // zip CLI nahi hai to tar.gz banao
        await run('tar', ['-czf', tmpZip + '.gz', ...targets], BOT_ROOT);
      }
      const file = fs.existsSync(tmpZip) ? tmpZip : tmpZip + '.gz';
      const finalName = file.endsWith('.gz') ? zipName + '.gz' : zipName;
      const buf = fs.readFileSync(file);
      await sock.sendMessage(chatId, {
        document: buf,
        mimetype: file.endsWith('.gz') ? 'application/gzip' : 'application/zip',
        fileName: finalName,
        caption: `📦 *Backup* ${finalName} (${(buf.length / 1024).toFixed(0)} KB)\n\n⚠️ *Do not share this file:* it contains your WhatsApp session.`
      }, { quoted: message });
    } catch (e) {
      return reply('❌ Backup fail: ' + String((e && e.message) || e).slice(0, 200));
    } finally {
      try { fs.unlinkSync(restoreTxt); } catch (_) {}
      try { fs.unlinkSync(tmpZip); } catch (_) {}
      try { fs.unlinkSync(tmpZip + '.gz'); } catch (_) {}
    }
  }
};
