/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply('Reply sticker biasa that mau dijadiin AI sticker ')

  let q = m.quoted
  let mime = q.mimetype || q.msg?.mimetype || ''

  if (!/webp/i.test(mime)) {
    return m.reply('Reply sticker webp yaa')
  }

  try {
    await m.react?.('🕒')

    let buffer = await q.download()
    if (!buffer) throw new Error('Failed download sticker')

    await conn.sendMessage(
      m.chat,
      {
        sticker: buffer,
        mimetype: 'image/webp',
        isAiSticker: true
      },
      { quoted: m }
    )

    await m.react?.('✅')
  } catch (e) {
    await m.react?.('❌')
    m.reply(`Failed bikin AI sticker:\n${e.message}`)
  }
}

handler.help = ['toaisticker']
handler.tags = ['sticker']
handler.command = /^(toai(sticker)?|aisticker|stickerai|sai)$/i
module.exports = handler