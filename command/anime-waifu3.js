/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.waifu.pics/sfw/waifu')
    let json = await res.json()

    let img = json.url
    let imgRes = await fetch(img)
    let buffer = await imgRes.buffer()

    await conn.sendFile(m.chat, buffer, 'waifu.jpg', '✨ Random Waifu', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Failed ambil image waifu.')
  }
}

handler.help = ['waifu3']
handler.tags = ['anime']
handler.command = /^(waifu3)$/i
handler.limit = true
module.exports = handler