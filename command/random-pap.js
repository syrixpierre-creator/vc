/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn }) => {
  try {
    await m.react('📸')

    const res = await fetch('https://api.nexadev.my.id/api/random/pap')
    const json = await res.json()

    if (!json.status) throw 'Failed mengambil PAP.'

    // Sesuaikan kalau field URL berbeda
    const image =
      json.result?.url ||
      json.result?.image ||
      json.result ||
      json.data

    if (!image) throw 'URL image not found.'

    await conn.sendMessage(
      m.chat,
      {
        image: { url: image },
        caption: '📸 *Random PAP*'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply(`❌ ${e}`)
  }
}

handler.help = ['pap']
handler.tags = ['internet', 'random']
handler.command = /^pap$/i
handler.limit = true
module.exports = handler