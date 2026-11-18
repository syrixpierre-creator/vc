/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} Apa itu bot wa`,
      m
    )
  }

  try {
    let url = `${global.APIs.faa}/faa/bard-google?query=${encodeURIComponent(text)}`
    let res = await fetch(url)
    let json = await res.json()

    if (!json.status) throw 'Failed mengambil jawaban.'

    conn.reply(m.chat, json.result.trim(), m)
  } catch (e) {
    conn.reply(m.chat, 'An error occurred saat mengambil data.', m)
  }
}

handler.help = ['bard <pertanyaan>']
handler.tags = ['ai']
handler.command = /^bard$/i
handler.limit = true
module.exports = handler