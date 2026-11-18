/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn }) => {
  if (!m.quoted) throw 'Reply to message that ingin di-unpin!'

  await conn.sendMessage(m.chat, {
    pin: {
      remoteJid: m.quoted.chat,
      fromMe: false,
      id: m.quoted.id,
      participant: m.quoted.sender
    },
    type: 2
  })

  m.reply('✅ Pin message success dihapus.')
}

handler.help = ['unpin']
handler.tags = ['group']
handler.command = ['unpin']

handler.group = true
handler.admin = true
handler.botAdmin = true
module.exports = handler