/**
 * QUEEN AKUMA v3.5.0 • #3 Group Backup & Restore (queen-akuma)
 * .backupgroup [name] — group settings/metadata ka backup (data/backups/)
 * .listbackups — saare backups dikhao
 * .restoregroup <name> — description, announce/restrict settings, welcome settings restore
 * Group-only + admin-only. Admin roles restore nahi ho sakte (WA limit).
 */
const fs = require('fs');
const path = require('path');
const backupDir = path.join(__dirname, '..', 'data', 'backups');
function ensureDir() { fs.mkdirSync(backupDir, { recursive: true }); }

module.exports = {
  command: 'backupgroup',
  aliases: ['restoregroup', 'groupbackup', 'listbackups'],
  category: 'group',
  description: 'Backup and restore group settings and configurations',
  usage: '.backupgroup [name] | .restoregroup <name> | .listbackups',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const invoked = String((context.rawText || message.body || '').replace(/^\./, '').split(/\s+/)[0] || 'backupgroup').toLowerCase();
    ensureDir();
    const safeJid = chatId.replace(/[^a-zA-Z0-9]/g, '_');

    if (invoked === 'listbackups') {
      try {
        const files = fs.readdirSync(backupDir)
          .filter((f) => f.startsWith(safeJid) && f.endsWith('.json'))
          .map((f) => {
            const stat = fs.statSync(path.join(backupDir, f));
            return { name: f.replace(`${safeJid}_`, '').replace('.json', ''), date: stat.mtime };
          })
          .sort((a, b) => b.date - a.date);
        if (!files.length) return reply('📦 *No backups found.*\n\nCreate one with `.backupgroup <name>`');
        const list = files.map((f, i) => `${i + 1}. 📦 *${f.name}*\n   _${f.date.toLocaleDateString('en-IN')} ${f.date.toLocaleTimeString('en-IN')}_`).join('\n\n');
        return reply(`📦 *Group Backups*\n\n${list}\n\n_Restore: \`.restoregroup <name>\`_`);
      } catch (_) { return reply('📦 No backups found.'); }
    }

    if (invoked === 'backupgroup' || invoked === 'groupbackup') {
      const backupName = args[0] || `backup_${Date.now()}`;
      try {
        let metadata = {};
        try { metadata = await sock.groupMetadata(chatId); } catch (_) {}
        const backup = {
          name: backupName, createdAt: Date.now(), groupJid: chatId,
          groupName: metadata.subject || '', groupDesc: metadata.desc || '',
          settings: { announce: metadata.announce || false, restrict: metadata.restrict || false },
          admins: (metadata.participants || []).filter((p) => p.admin).map((p) => ({ jid: p.id, admin: p.admin })),
          memberCount: (metadata.participants || []).length,
          welcomeSettings: global.welcomeSettings?.get(chatId) || null,
        };
        fs.writeFileSync(path.join(backupDir, `${safeJid}_${backupName}.json`), JSON.stringify(backup, null, 2));
        return reply(`✅ *Group backup created!*\n\n📦 *Name:* ${backupName}\n👥 *Members:* ${backup.memberCount}\n👑 *Admins:* ${backup.admins.length}\n📝 *Description:* ${backup.groupDesc ? 'Yes' : 'None'}\n\n_Restore later: \`.restoregroup ${backupName}\`_`);
      } catch (e) { return reply(`❌ Backup failed: ${e.message}`); }
    }

    if (invoked === 'restoregroup') {
      if (!args[0]) return reply('❌ Specify backup name.\n\nUse `.listbackups` to see available backups.\nThen: `.restoregroup <name>`');
      const backupName = args[0];
      const filePath = path.join(backupDir, `${safeJid}_${backupName}.json`);
      if (!fs.existsSync(filePath)) return reply(`❌ Backup "${backupName}" not found.\n\nUse \`.listbackups\` to see available backups.`);
      try {
        const backup = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const restored = [];
        if (backup.groupDesc) {
          try { await sock.groupUpdateDescription(chatId, backup.groupDesc); restored.push('✅ Description'); }
          catch (_) { restored.push('❌ Description (no permission)'); }
        }
        if (backup.settings) {
          try {
            await sock.groupSettingUpdate(chatId, backup.settings.announce ? 'announcement' : 'not_announcement');
            restored.push('✅ Announce setting');
          } catch (_) { restored.push('❌ Announce setting'); }
          try {
            await sock.groupSettingUpdate(chatId, backup.settings.restrict ? 'locked' : 'unlocked');
            restored.push('✅ Restrict setting');
          } catch (_) { restored.push('❌ Restrict setting'); }
        }
        if (backup.welcomeSettings && global.welcomeSettings) {
          global.welcomeSettings.set(chatId, backup.welcomeSettings);
          restored.push('✅ Welcome settings');
        }
        return reply(`📦 *Restore Results*\n\n*Backup:* ${backupName}\n*Created:* ${new Date(backup.createdAt).toLocaleDateString('en-IN')}\n\n${restored.join('\n')}\n\n_Note: Admin roles cannot be restored automatically._`);
      } catch (e) { return reply(`❌ Restore failed: ${e.message}`); }
    }
    return reply('📦 Usage: `.backupgroup [name]` | `.restoregroup <name>` | `.listbackups`');
  },
};
