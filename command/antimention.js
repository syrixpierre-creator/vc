const { cmd } = require('../command.js');
const { getGroupSetting, setGroupSetting } = require('../../lib/database/groupSettings');
function isGroup(jid) { return String(jid || '').endsWith('@g.us'); }
function messageText(message) {
    return message?.conversation || message?.extendedTextMessage?.text || message?.imageMessage?.caption || message?.videoMessage?.caption || '';
}
function hasMention(message) {
    const context = message?.extendedTextMessage?.contextInfo || message?.imageMessage?.contextInfo || message?.videoMessage?.contextInfo || {};
    return Array.isArray(context.mentionedJid) && context.mentionedJid.length > 0 || /@[0-9]{5,}/.test(messageText(message));
}
cmd({ pattern: 'antimention', aliases: ['amention', 'mentionblock', 'nomention'], category: 'group' }, async (conn, m, store, { from, reply, isGroup: group }) => {
    if (!group || !isGroup(from))
        return reply('❌ This command can only be used in a group.');
    const option = String(m?.message?.conversation || m?.message?.extendedTextMessage?.text || '').trim().split(/\s+/)[1]?.toLowerCase();
    if (!['on', 'off', 'status'].includes(option))
        return reply('Usage: `.antimention on`, `.antimention off` or `.antimention status`');
    if (option === 'status')
        return reply(`🏷️ Anti-mention is *${(await getGroupSetting(from, 'antimention', false)) ? 'ON' : 'OFF'}*`);
    await setGroupSetting(from, 'antimention', option === 'on');
    return reply(`✅ Anti-mention turned *${option.toUpperCase()}*.`);
});
cmd({ on: 'body' }, async (conn, m, store, { from, isGroup: group }) => {
    if (!group || !isGroup(from) || !(await getGroupSetting(from, 'antimention', false)))
        return;
    if (!hasMention(m?.message))
        return;
    try {
        await conn.sendMessage(from, { delete: m.key });
    }
    catch (error) {
        console.log('[ANTIMENTION] Delete failed:', error?.message || error);
    }
});
