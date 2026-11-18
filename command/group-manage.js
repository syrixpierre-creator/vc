/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const handler = async (m, { text, participants, groupMetadata, command }) => {
 const target = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;

 const cmd = ['add', 'kick', 'promote', 'demote'];

 if (cmd.includes(command) && !target) return m.reply('Reply/tag who that ingin di process.');

 const inGc = participants.some((v) => v.jid == target || v.id === target || v.phoneNumber === target);

 switch (command) {
  case 'add':
   {
    if (inGc) return m.reply('User already there is didalam group!');
    const response = await conn.groupParticipantsUpdate(m.chat, [target], 'add');
    const jpegThumbnail = await conn.profilePictureUrl(m.chat, 'image');

    for (const participant of response) {
     const jid = participant.content.attrs.phone_number || participant.content.attrs.jid;
     const status = participant.status;

     if (status === '408') {
      m.reply(`Cannot menambahkan @${jid.split('@')[0]}!\nMungkin @${jid.split('@')[0]} baru keluar from group this or dikick`);
     } else if (status === '403') {
      const inviteCode = participant.content.content[0].attrs.code;
      const inviteExp = participant.content.content[0].attrs.expiration;
      await m.reply(`Mengundang @${jid.split('@')[0]} menggunakan invite...`);

      await conn.sendGroupV4Invite(m.chat, jid, inviteCode, inviteExp, groupMetadata.subject, 'Undangan for bergabung ke group WhatsApp saya', jpegThumbnail);
     }
    }
   }
   break;

  case 'kick':
   if (!inGc) return m.reply('User no in group.');
   conn.groupParticipantsUpdate(m.chat, [target], 'remove');
   m.reply(`Success kick: @${target.split('@')[0]}`);
   break;

  case 'promote':
   if (!inGc) return m.reply('User not berada in group!');
   conn.groupParticipantsUpdate(m.chat, [target], 'promote');
   m.reply(`Promote: @${target.split('@')[0]}`);
   break;

  case 'demote':
   if (!inGc) return m.reply('User not berada in group!');
   conn.groupParticipantsUpdate(m.chat, [target], 'demote');
   m.reply(`Demote: @${target.split('@')[0]}`);
   break;

  // ✅ FIXED SECTION
  case 'opengc':
  case 'unmute':
   await conn.groupSettingUpdate(m.chat, 'not_announcement');
   m.reply('Group success dibuka (all member can chat).');
   break;

  case 'closegc':
  case 'mute':
   await conn.groupSettingUpdate(m.chat, 'announcement');
   m.reply('Group success ditutup (hanya admin that can chat).');
   break;

  default:
   return m.reply('Command not dikenal.');
 }
};

handler.help = ['add', 'kick', 'promote', 'demote', 'opengc', 'closegc'];
handler.tags = ['group'];
handler.command = /^(add|kick|promote|demote|mute|unmute|opengc|closegc)$/i;
handler.admin = true;

handler.group = true;
handler.botAdmin = true;
module.exports = handler;