/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Quotes Anime
Plugins ESM
API : https://api.sxtream.xyz
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.sxtream.xyz/randomtext/quotesanime')
    if (!res.ok) throw await res.text()
    let json = await res.json()

    if (!json.success) throw 'Failed mengambil quote.'

    await conn.reply(m.chat, `🌸 *Anime Quotes* 🌸\n\n"${json.data}"`, m)
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '⚠️ Failed mengambil quotes anime.', m)
  }
}

handler.help = ['quotesanime']
handler.tags = ['quotes']
handler.command = /^quotesanime$/i
handler.limit = true
module.exports = handler