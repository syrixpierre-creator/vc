/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Berita Bola
Type : Plugins ESM
API : https://zenz.biz.id
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://zenz.biz.id/berita/berita-bola')
    const json = await res.json()

    if (!json.status || !json.result) throw 'Failed mengambil news bola'

    const beritaList = json.result.slice(0, 10)

    let teks = '⚽ *Berita Bola Terbaru:*\n\n' + beritaList.map((v, i) => {
      return `*${i + 1}. ${v.title}*\n🕒 ${v.published}\n🔗 ${v.link}`
    }).join('\n\n')

    await conn.sendMessage(m.chat, { text: teks.trim() }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('Failed mengambil news bola. Try again nanti.')
  }
}

handler.help = ['beritabola']
handler.tags = ['internet']
handler.command = /^beritabola$/i
handler.limit = true
module.exports = handler