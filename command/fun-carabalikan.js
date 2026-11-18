/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn }) => {
  let teks = [
    'Badut paling setia that masih berharap dia balik again padahal udah punya that baru 🤡'
  ]

  let hasil = teks[Math.floor(Math.random() * teks.length)]

  conn.sendMessage(m.chat, {
    text: hasil
  }, { quoted: m })
}

handler.help = ['carabalikan']
handler.tags = ['fun']
handler.command = /^carabalikan$/i
module.exports = handler