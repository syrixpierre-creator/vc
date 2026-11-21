// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

function realJid(p) {
    // Newer Baileys may return participants as @lid. Prefer the
    // resolvable phone number / s.whatsapp.net JID when available.
    if (p.phoneNumber) return p.phoneNumber.includes('@') ? p.phoneNumber : `${p.phoneNumber}@s.whatsapp.net`;
    if (p.jid && p.jid.endsWith('@s.whatsapp.net')) return p.jid;
    if (p.id && p.id.endsWith('@s.whatsapp.net')) return p.id;
    return p.id; // last resort
}

module.exports = {
    command: 'listadmins',
    aliases: ['admins', 'getadmins', 'adminlist'],
    category: 'group',
    description: 'List all admins in the group (real numbers)',
    usage: '.listadmins',
    groupOnly: true,
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        try {
            // Send reaction
            await sock.sendMessage(chatId, {
                react: { text: '👑', key: message.key }
            }).catch(() => {});

            // Get group metadata
            const meta = await sock.groupMetadata(chatId);
            const participants = meta.participants || [];
            const admins = participants.filter(p => p.admin);
            const superAdmins = participants.filter(p => p.admin === 'superadmin');
            const normalAdmins = admins.filter(p => p.admin !== 'superadmin');

            if (!admins.length) {
                await sock.sendMessage(chatId, {
                    text: '👑 No admins found in this group.'
                }, { quoted: fakeSender });
                return;
            }

            const adminJids = admins.map(realJid);
            const superAdminJids = superAdmins.map(realJid);

            // Build admin list
            let list = '';

            // Super Admins (Owners)
            if (superAdmins.length > 0) {
                list += `*Owner*\n`;
                superAdmins.forEach((a, i) => {
                    const jid = superAdminJids[i];
                    const num = jid.split('@')[0].split(':')[0];
                    list += ` ${i + 1}. @${num}\n`;
                });
                list += `\n`;
            }

            // Normal Admins
            if (normalAdmins.length > 0) {
                list += `*Admins*\n`;
                const normalJids = normalAdmins.map(realJid);
                normalAdmins.forEach((a, i) => {
                    const jid = normalJids[i];
                    const num = jid.split('@')[0].split(':')[0];
                    list += ` ${i + 1}. @${num}\n`;
                });
            }

            // Total counts
            const total = participants.length;
            const adminCount = admins.length;
            const superAdminCount = superAdmins.length;
            const normalAdminCount = normalAdmins.length;
            const regularCount = total - adminCount;

            // Build status bar
            const barLength = 20;
            const adminFilled = Math.round((adminCount / total) * barLength);
            const adminBar = ''.repeat(adminFilled) + ''.repeat(barLength - adminFilled);

            // Get bot's status
            const botJid = sock.user?.id || '';
            const botIsAdmin = admins.some(a => realJid(a) === botJid);
            const botIsSuperAdmin = superAdmins.some(a => realJid(a) === botJid);

            const text = `👑 *Group admins (${adminCount})*\n\n${list}`.trim();

            // All admin JIDs for mentions
            const allAdminJids = [...superAdminJids, ...normalAdmins.map(realJid)];

            await sock.sendMessage(chatId, {
                text: text,
                mentions: allAdminJids
            }, { quoted: fakeSender });

            // Success reaction
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (error) {
            console.error('[listadmins]', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ *Failed to get admin list!*'
            }, { quoted: fakeSender });
        }
    }
};