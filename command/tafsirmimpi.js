/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} Senang`,
      m
    )
  }

  try {
    let api = `${global.APIs.faa}/faa/tafsir-mimpi?mimpi=${encodeURIComponent(text)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) throw 'API error'

    let hasil = `Tafsir mimpi: *${json.mimpi}*\n\n${json.result}`

    conn.reply(m.chat, hasil, m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Failed mengambil tafsir mimpi.', m)
  }
}

handler.help = ['mimpi2 <kata>']
handler.tags = ['fun']
handler.command = /^mimpi2$/i
handler.limit = true
module.exports = handler