const database = require('../lib/database');
// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';
// import database from '../lib/database.js';

module.exports = {
    command: 'listinactive',
    aliases: ['inactive', 'dormant', 'sleepers', 'inactives'],
    category: 'group',
    description: 'List inactive/dormant members in the group',
    usage: '.listinactive [days]',
    groupOnly: true,
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        try {
            // Send reaction
            await sock.sendMessage(chatId, {
                react: { text: '😴', key: message.key }
            }).catch(() => {});

            // Get group metadata
            const meta = await sock.groupMetadata(chatId);
            const participants = meta?.participants || [];

            if (!participants.length) {
                await sock.sendMessage(chatId, {
                    text: '👥 No participants found in this group.'
                }, { quoted: fakeSender });
                return;
            }

            // Parse custom days threshold (default: 7)
            const daysThreshold = parseInt(args[0]) || 7;
            if (daysThreshold < 1 || daysThreshold > 365) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ Please enter a valid number of days (1-365).\nExample: .listinactive 14'
                }, { quoted: fakeSender });
                return;
            }

            const now = Date.now();
            const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
            const inactive = [];
            const active = [];

            // Get admin list
            const adminJids = new Set(
                participants.filter(p => p.admin).map(p => p.id)
            );

            // Check each participant's activity
            for (const p of participants) {
                const jid = p.id;
                const isAdmin = adminJids.has(jid);

                // Get last seen from database
                const lastSeen = database.getLastSeen(chatId, jid);
                const messageCount = database.getMessageCount(chatId, jid);

                if (lastSeen === 0) {
                    // Never seen
                    inactive.push({ jid, days: 'Never', isAdmin, messageCount });
                } else if (now - lastSeen > thresholdMs) {
                    // Inactive for more than threshold
                    const days = Math.floor((now - lastSeen) / (24 * 60 * 60 * 1000));
                    inactive.push({ jid, days, isAdmin, messageCount });
                } else {
                    // Active
                    active.push({ jid, lastSeen, messageCount });
                }
            }

            // Sort inactive by days (most inactive first)
            inactive.sort((a, b) => {
                if (a.days === 'Never') return -1;
                if (b.days === 'Never') return 1;
                return b.days - a.days;
            });

            const total = participants.length;
            const inactiveCount = inactive.length;
            const activeCount = active.length;

            // Build status bar
            const barLength = 20;
            const filled = Math.round((inactiveCount / total) * barLength);
            const bar = ''.repeat(filled) + ''.repeat(barLength - filled);

            let text = ` ⟮ 😴 ${botName} ⟯⊷
 *INACTIVE MEMBERS*

 📊 Inactivity Threshold: *${daysThreshold} days*
 📊 Status: [${bar}]

 👥 Total: *${total}* members
 😴 Inactive: *${inactiveCount}*
 🟢 Active: *${activeCount}*
 👑 Admins: *${adminJids.size}*


`;

            if (inactiveCount === 0) {
                text += `\n ✅ *No inactive members found!*\n All members are active. 🎉`;
            } else {
                const maxDisplay = 20;
                const displayList = inactive.slice(0, maxDisplay);

                text += `\n *Inactive Members:*`;
                for (const user of displayList) {
                    const name = user.jid.split('@')[0];
                    const daysText = user.days === 'Never' ? '❌ Never active' : `📅 ${user.days}d inactive`;
                    const adminTag = user.isAdmin ? ' 👑' : '';
                    const msgCount = user.messageCount || 0;
                    const msgIcon = msgCount === 0 ? '📭' : '💬';

                    text += `\n ${user.isAdmin ? '👑' : '😴'} @${name}${adminTag} — ${daysText} (${msgIcon} ${msgCount} msgs)`;
                }

                if (inactiveCount > maxDisplay) {
                    text += `\n\n _...and ${inactiveCount - maxDisplay} more inactive members_`;
                }

                // Add warning if admins are inactive
                const inactiveAdmins = inactive.filter(u => u.isAdmin);
                if (inactiveAdmins.length > 0) {
                    text += `\n\n ⚠️ *${inactiveAdmins.length} admin(s) are inactive!*`;
                }
            }

            text += `\n⊷

💡 *Tip:* Use .kickinactive ${daysThreshold} to remove them
_⚡ Powered by ${botName}_`;

            const mentions = inactive.map(u => u.jid);
            await sock.sendMessage(chatId, {
                text: text,
                mentions: mentions
            }, { quoted: fakeSender });

            // Success reaction
            await sock.sendMessage(chatId, {
                react: { text: '📋', key: message.key }
            }).catch(() => {});

        } catch (err) {
            console.error('[listinactive]', err.message);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${err.message || 'Failed to list inactive members'}`
            }, { quoted: fakeSender });
        }
    }
};