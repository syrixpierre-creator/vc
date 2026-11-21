'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .zip / .botzip (Flash port).
 * Owner poora bot zip karke DM me le. Owner-only + DM-only.
 * Excludes: node_modules, .git, session, .env, tmp files. 50MB cap.
 * zip CLI pehle, nahi to tar fallback (fullbackup jaisa).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const BOT_ROOT = path.join(__dirname, '..');
const MAX_ZIP = 50 * 1024 * 1024;

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, timeout: 120000, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(String(stderr || err.message || err).slice(-300)));
      resolve(stdout || '');
    });
  });
}

module.exports = {
  command: 'zip',
  aliases: ['botzip', 'zipbot'],
  description: 'Poora bot zip karke DM me bhejo (owner-only).',
  category: 'owner',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
    if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
    if (String(chatId).endsWith('@g.us')) {
      await reply('🔒 *Use this command in DM.*');
      return;
    }
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const zipName = 'QUEEN-AKUMA-' + stamp + '.zip';
    const tmpZip = path.join(os.tmpdir(), zipName);
    await reply('⏳ Zipping the bot...');
    try {
      try {
        await run('zip', ['-r', '-q', tmpZip, '.', '-x', 'node_modules/*', '-x', '.git/*', '-x', 'session/*', '-x', '.env', '-x', '*.log', '-x', 'tmp/*'], BOT_ROOT);
      } catch (e) {
        // tar fallback
        const tmpTar = tmpZip.replace(/\.zip$/, '.tar.gz');
        await run('tar', ['--exclude=node_modules', '--exclude=.git', '--exclude=session', '--exclude=.env', '-czf', tmpTar, '.'], BOT_ROOT);
        const st = fs.statSync(tmpTar);
        if (st.size > MAX_ZIP) { fs.unlinkSync(tmpTar); await reply('❌ *Bot is bigger than 50MB* (' + (st.size / 1048576).toFixed(1) + ' MB). Cannot send the zip.'); return; }
        await sock.sendMessage(chatId, { document: fs.readFileSync(tmpTar), mimetype: 'application/gzip', fileName: zipName.replace(/\.zip$/, '.tar.gz') }, { quoted: message });
        fs.unlinkSync(tmpTar);
        return;
      }
      const st = fs.statSync(tmpZip);
      if (st.size > MAX_ZIP) { fs.unlinkSync(tmpZip); await reply('❌ *Bot is bigger than 50MB* (' + (st.size / 1048576).toFixed(1) + ' MB). Cannot send the zip.'); return; }
      await sock.sendMessage(chatId, { document: fs.readFileSync(tmpZip), mimetype: 'application/zip', fileName: zipName, caption: '🤖 QUEEN AKUMA bot zip (' + (st.size / 1048576).toFixed(1) + ' MB)' }, { quoted: message });
      fs.unlinkSync(tmpZip);
    } catch (e) {
      await reply('❌ Zip nahi ban paya: ' + String(e.message || e).slice(0, 150));
    }
  }
};
