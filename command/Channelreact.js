/* QUEEN AKUMA legacy plugin (family B) — converted automatically */
const { cmd } = require('../lib/compat').registrar;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const isNewsletterJid = value => /^\d{8,}@newsletter$/i.test(String(value || '').trim());
const isMessageId = value => /^\d+$/.test(String(value || '').trim());
function parseTarget(input) {
  const value = String(input || '').trim();
  const url = value.match(/(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([^/\s]+)\/(\d+)/i);
  if (url) return { kind: 'invite', invite: url[1], messageId: url[2] };
  const jid = value.match(/(\d{8,}@newsletter)(?:[/:](\d+))?/i);
  if (jid) return { kind: 'jid', channelJid: jid[1], messageId: jid[2] };
  return null;
}
function parseReactions(values) { return [...new Set(values.join(' ').split(/[\s,]+/).map(x => x.trim()).filter(Boolean))].filter(x => x.length <= 16).slice(0, 20); }
async function reactToNewsletter(conn, jid, messageId, reaction) {
  if (typeof conn.newsletterReactMessage === 'function') return conn.newsletterReactMessage(jid, messageId, reaction);
  if (typeof conn.newsletterReact === 'function') return conn.newsletterReact(jid, messageId, reaction);
  throw new Error('Your Baileys version does not support newsletter reactions.');
}
cmd({ pattern: 'chreact', aliases: ['creact', 'channelreact'], react: '❤️', desc: 'React to a WhatsApp Channel post by URL or newsletter JID', category: 'owner' }, async (conn, mek, _store, context) => {
  const { q, args, reply, isOwner, isSuperUser, isAdmin, isGroup } = context;
  if (!isOwner && !isSuperUser && !(isGroup && isAdmin)) return reply('🚫 *You are not authorized to use this command!*');
  if (!q) return reply(`📌 *Usage:* .chreact <channel post link> 😍,❤️,😂`);
  const target = parseTarget(args[0]);
  if (!target) return reply('❌ Invalid channel target. WhatsApp Channel post URL ya valid number@newsletter JID do.');
  let messageId = target.messageId;
  let channelJid = target.channelJid;
  let reactionArgs = args.slice(1);
  if (target.kind === 'jid' && !messageId && isMessageId(args[1])) { messageId = args[1]; reactionArgs = args.slice(2); }
  if (!messageId || !isMessageId(messageId)) return reply('❌ Message ID missing hai. Example: .chreact 120363403408693274@newsletter 3129 😍,❤️');
  try {
    if (target.kind === 'invite') {
      if (typeof conn.newsletterMetadata !== 'function') throw new Error('Newsletter metadata API is not available.');
      const metadata = await conn.newsletterMetadata('invite', target.invite);
      channelJid = metadata?.id;
      if (!isNewsletterJid(channelJid)) throw new Error('❌ *Channel not found from this link.*');
    }
    if (!isNewsletterJid(channelJid)) return reply('❌ Invalid newsletter JID. Format: 120363403408693274@newsletter');
    const reactions = parseReactions(reactionArgs.length ? reactionArgs : ['❤️', '😍', '😳', '🥰']);
    if (!reactions.length) return reply('❌ Kam se kam ek valid reaction do. Example: 😍,❤️,😂');
    await reply(`⏳ Channel post ${messageId} par ${reactions.length} reaction bhej raha hoon...`);
    const results = [];
    for (const reaction of reactions) {
      try { await reactToNewsletter(conn, channelJid, messageId, reaction); results.push(`✅ ${reaction}`); }
      catch (error) { results.push(`❌ ${reaction} (${error.message})`); }
      await sleep(500);
    }
    return reply(`*Channel Reaction Result*\n\n*JID:* ${channelJid}\n*Post:* ${messageId}\n${results.join('\n')}`);
  } catch (error) { console.error('[CHREACT ERROR]', error); return reply(`❌ Channel reaction failed: ${error.message}`); }
});
