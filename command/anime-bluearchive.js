/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn }) => {
  await conn.reply(m.chat, global.wait, m)

  try {
    let res = await fetch('https://raw.githubusercontent.com/rynxzyy/blue-archive-r-img/refs/heads/main/links.json')
    if (!res.ok) throw await res.text()

    let data = await res.json()
    if (!Array.isArray(data) || data.length === 0) throw 'Image not found'

    let img = data[Math.floor(Math.random() * data.length)]

    await conn.sendFile(m.chat, img, 'blue-archive.jpg', '✨ _Random Blue Archive_', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ An error occurred: ' + e)
  }
}

handler.help = ['bluearchive']
handler.tags = ['anime']
handler.command = /^bluearchive|baimg|blue-archive$/i
handler.limit = false
module.exports = handler