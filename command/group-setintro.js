/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
// fitur : set intro
let handler = async (m, { text, command }) => {
  if (!m.isGroup) throw 'Feature this group only!'

  let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})

  if (command === 'setintro') {
    if (!text) throw 'Example:\n.setintro Selamat datang di group this'
    chat.intro = text
    return m.reply('✅ Intro group success disimpan')
  }

  if (command === 'intro') {
    if (!chat.intro) throw 'Intro not yet diset'
    return m.reply(chat.intro)
  }

  if (command === 'delintro') {
    delete chat.intro
    return m.reply('🗑️ Intro success dihapus')
  }
}

handler.help = ['setintro', 'intro', 'delintro']
handler.tags = ['group']
handler.command = /^(setintro|intro|delintro)$/i
handler.admin = true
handler.group = true
module.exports = handler