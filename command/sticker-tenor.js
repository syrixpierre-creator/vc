/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const { sticker } = require('./_shim/sticker.js');
const { StickerTypes } = require('wa-sticker-formatter');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `*Example :* ${usedPrefix + command} Ryo Yamada`,
      m
    )
  }

  try {
    const { data } = await axios.get(
      `${global.APIs.faa}/faa/stickerly?q=${encodeURIComponent(text)}`
    )

    const results = data?.results?.slice(0, 5)
    if (!results?.length) return

    for (const i of results) {
      try {
        let img = await axios.get(i.url, { responseType: 'arraybuffer' })
        let buffer = Buffer.from(img.data)

        const stiker = await sticker(
          buffer,
          false,
          i.title || 'QUEEN AKUMA',
          i.creator || 'Hilman',
          { type: StickerTypes.FULL, animated: true }
        )

        if (stiker) {
          await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
        }
      } catch {}
    }
  } catch {}
}

handler.help = ['tenor']
handler.tags = ['sticker']
handler.command = /^tenor$/i
handler.limit = true
module.exports = handler