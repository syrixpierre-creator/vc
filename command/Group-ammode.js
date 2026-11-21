/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
==========================================================
Plugins By © Amane Ofc — Toggle AM Mode
==========================================================
*/

let handler = async (m, { args, isAdmin, isOwner }) => {
  // Pengecekan manual seperti di code antitagsw
  if (!m.isGroup) return m.reply("Fitur ini hanya dapat digunakan dalam grup.")
  if (!(isAdmin || isOwner)) return m.reply("Sorry, feature this hanya for owner.")

  // init db chats
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]

  if (!args[0]) {
    return m.reply(
`📌 *Usage:* .ammode on / off`
    )
  }

  if (args[0] === "on") {
    if (chat.am_mode) return m.reply("AM Mode already aktif di group this.")

    chat.am_mode = true

    return m.reply(`✅ *AM MODE AKTIF!*\n\nGrup this sekarang beralih ke Mode Khusus Alight Motion Premium.\nSeluruh member can menggunakan feature AM Prem secara gratis! Ketik *.ammenu* for melihat feature.`)
  }

  if (args[0] === "off") {
    if (!chat.am_mode) return m.reply("AM Mode already nonaktif.")

    chat.am_mode = false
    return m.reply("❌ *AM MODE DIMATIKAN!*\n\nFitur Alight Motion kembali normal (Khusus Premium).")
  }

  return m.reply("Opsi invalid. Gunakan 'on' or 'off'.")
}

handler.command = /^(ammode|modeam)$/i
handler.help = [
  "ammode on",
  "ammode off"
]
handler.tags = ["group"]
handler.group = true
handler.owner = true
module.exports = handler