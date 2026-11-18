/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `*Example :* ${usedPrefix + command} Saya currently belajar membuat bot whatsapp`,
      m
    )
  }

  let url = `${global.APIs.faa}/faa/quillbot?text=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status) return

  conn.reply(m.chat, json.result.trim(), m)
}

handler.help = ['quillbot']
handler.tags = ['ai']
handler.command = /^quillbot$/i
handler.limit = true
module.exports = handler