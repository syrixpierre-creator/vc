/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn, args, isBotAdmin, isAdmin }) => {
  if (!m.isGroup) return m.reply('Feature this group only!');
  if (!isAdmin) return m.reply('Fitur ini hanya bisa digunakan oleh admin grup.');
  if (!isBotAdmin) return m.reply('Bot harus menjadi admin di grup!');

  let time = parseInt(args[0]);
  let unit = args[1];

  if (!time || !unit) {
    return m.reply(`*Example Usage:*\n.opentime 10 second\n\n*Opsi Time:*\nsecond\nminute\nhour\nday`);
  }

  let timer;
  switch (unit) {
    case 'second': timer = time * 1000; break;
    case 'minute': timer = time * 60000; break;
    case 'hour': timer = time * 3600000; break;
    case 'day': timer = time * 86400000; break;
    default:
      return m.reply('*Opsi invalid!*\nGunakan: second, minute, hour, or day');
  }

  m.reply(`⏳ Grup akan dibuka dalam *${time} ${unit}*...`);

  setTimeout(async () => {
    await conn.groupSettingUpdate(m.chat, 'not_announcement');
    conn.sendMessage(m.chat, {
      text: '*[ OPEN TIME ]*\nGrup telah dibuka kembali. Sekarang semua member bisa mengirim pesan.'
    });
  }, timer);
};

handler.command = ['opentime'];
handler.help = ['opentime <angka> <unit>'];
handler.tags = ['group'];
handler.group = true;
handler.botAdmin = true;
handler.admin = true;
module.exports = handler;