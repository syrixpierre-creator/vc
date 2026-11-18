const { cmd } = require('../command');
const config = require('../config');
function normalizeId(id) {
    if (!id)
        return '';
    return String(id)
        .replace(/:[0-9]+/g, '')
        .replace(/@(lid|s\.whatsapp\.net|c\.us|g\.us)/g, '')
        .replace(/[^0-9]/g, '');
}
async function isAdmin(conn, chatId, userId) {
    const metadata = await conn.groupMetadata(chatId);
    const target = normalizeId(userId);
    return (metadata.participants || []).some((p) => {
        const ids = [p.id, p.lid, p.jid, p.phoneNumber].filter(Boolean);
        return ids.some((id) => normalizeId(id) === target) &&
            (p.admin === 'admin' || p.admin === 'superadmin');
    });
}
async function botIsAdmin(conn, chatId) {
    const metadata = await conn.groupMetadata(chatId);
    const botIds = [conn.user?.id, conn.user?.lid].filter(Boolean).map(normalizeId);
    return (metadata.participants || []).some((p) => {
        if (p.admin !== 'admin' && p.admin !== 'superadmin')
            return false;
        return [p.id, p.lid, p.jid, p.phoneNumber].filter(Boolean)
            .some((id) => botIds.includes(normalizeId(id)));
    });
}
function unwrap(message) {
    let current = message;
    for (let i = 0; i < 6 && current; i += 1) {
        if (current.ephemeralMessage?.message)
            current = current.ephemeralMessage.message;
        else if (current.viewOnceMessage?.message)
            current = current.viewOnceMessage.message;
        else if (current.viewOnceMessageV2?.message)
            current = current.viewOnceMessageV2.message;
        else if (current.documentWithCaptionMessage?.message)
            current = current.documentWithCaptionMessage.message;
        else
            break;
    }
    return current || {};
}
function forwardedInfo(message) {
    const root = unwrap(message);
    const entries = Object.entries(root);
    for (const [type, value] of entries) {
        if (!value || typeof value !== 'object')
            continue;
        const context = value.contextInfo || {};
        if (context.isForwarded === true || Number(context.forwardingScore || 0) > 0) {
            return { type, score: Number(context.forwardingScore || 0) };
        }
    }
    const rootContext = root.contextInfo || {};
    if (rootContext.isForwarded === true || Number(rootContext.forwardingScore || 0) > 0) {
        return { type: 'message', score: Number(rootContext.forwardingScore || 0) };
    }
    return null;
}
// Auto-protection: enabled by default. Set ANTI_FORWARDED=false in config to disable.
cmd({ on: 'body' }, async (conn, m, store, { from, sender, isGroup }) => {
    try {
        if (!isGroup || !m?.key?.id || !m.message)
            return;
        if (config.ANTI_FORWARDED === false || config.ANTI_FORWARDED === 'false')
            return;
        const info = forwardedInfo(m.message);
        if (!info)
            return;
        if (await isAdmin(conn, from, sender))
            return;
        if (!(await botIsAdmin(conn, from)))
            return;
        await conn.sendMessage(from, { delete: m.key });
        await conn.sendMessage(from, {
            text: `⚠️ @${String(sender).split('@')[0]} ka forwarded ${info.type.replace('Message', '')} message delete kar diya gaya.\n\n_Admins forwarded messages bhej sakte hain._`,
            mentions: [sender]
        });
    }
    catch (error) {
        console.error('[ANTIFORWARDED] Error:', error.message || error);
    }
});
// Optional command to check whether the protection is active.
cmd({ pattern: 'antiforwarded', aliases: ['noforward', 'forwardguard'], category: 'group' }, async (conn, m, store, { from, reply, isGroup, isAdmin }) => {
    if (!isGroup)
        return reply('❌ *This command can only be used in groups!*');
    if (!isAdmin)
        return reply('❌ Sirf group admins is protection ko check kar sakte hain.');
    return reply('✅ Anti-forwarded protection active hai. Normal users ke forwarded messages auto-delete honge; admins exempt hain.');
});
