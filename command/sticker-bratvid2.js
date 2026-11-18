/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
• Plugins Brat Video
• Source: https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
• Api: https://api.nekorinn.my.id
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: 'Example: .bratvid aku gppa kok:v'
    }, { quoted: m })
  }

  await conn.sendMessage(m.chat, {
    react: {
      text: '🎀',
      key: m.key
    }
  })

  try {
    const url = `https://api.nekorinn.my.id/maker/bratvid?text=${encodeURIComponent(text)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed mengambil video from API.')

    const videoBuffer = Buffer.from(await res.arrayBuffer())

    const stiker = new Sticker(videoBuffer, {
      pack: 'QUEEN AKUMA',
      author: 'ytta',
      type: StickerTypes.FULL,
      quality: 70,
      animated: true
    })

    const stickerBuffer = await stiker.toBuffer()

    await conn.sendMessage(m.chat, {
      sticker: stickerBuffer
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: 'Failed membuat stiker bratvid. Try again nanti.'
    }, { quoted: m })
  }
}

handler.help = ['bratvid2 <text>']
handler.tags = ['sticker']
handler.command = /^bratvid2$/i
handler.limit = true
module.exports = handler