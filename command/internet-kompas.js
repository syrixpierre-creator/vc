/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Berita Kompas
Type : Plugins ESM
API : https://zenz.biz.id
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn }) => {
  try {
    const res = await fetch(`https://zenz.biz.id/berita/kompas`)
    const json = await res.json()

    if (!json.status || !json.result) throw 'Failed mengambil news'

    const beritaList = json.result.filter(v => v.title && v.url).slice(0, 10)
    let teks = '📢 *Berita Kompas Terbaru:*\n\n' + beritaList.map((v, i) => {
      return `*${i + 1}. ${v.title}*\n🔗 ${v.url}`
    }).join('\n\n')

    await conn.sendMessage(m.chat, { text: teks.trim() }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('Failed mengambil news. Try again nanti.')
  }
}

handler.help = ['kompas']
handler.tags = ['internet']
handler.command = /^kompas$/i
handler.limit = true
module.exports = handler