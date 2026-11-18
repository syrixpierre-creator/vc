/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Maker Sertifikat Dark Sistem
Type : Plugin ESM
API : https://api.sxtream.xyz
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Send command *${usedPrefix + command} [text]*\n\nContoh: *${usedPrefix + command} Hilman*`)

  try {
    let url = `https://api.sxtream.xyz/maker/yapping?name=${encodeURIComponent(text)}`
    let res = await fetch(url)

    if (!res.ok) throw '❌ Failed mengambil data from API.'

    let buffer = await res.buffer()
    await conn.sendFile(m.chat, buffer, 'srtdarksistem.jpg', `🗣️ Sertifikat Dark Sistem by *${text}*`, m)

  } catch (e) {
    console.error(e)
    m.reply('❌ An error occurred saat mengambil image.')
  }
}

handler.help = ['srtdarksistem <teks>']
handler.tags = ['maker']
handler.command = /^srtdarksistem$/i
handler.limit = true
module.exports = handler