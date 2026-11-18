/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Example:\n${usedPrefix + command} 8991234567890`)

  try {
    const url = `https://barcodeapi.org/api/128/${encodeURIComponent(text)}`

    await conn.sendFile(
      m.chat,
      url,
      'barcode.png',
      `📦 Barcode:\n${text}`,
      m
    )
  } catch (e) {
    m.reply('Failed membuat barcode.')
  }
}

handler.help = ['barcode <teks>']
handler.tags = ['tools']
handler.command = /^barcode$/i
handler.limit = true
module.exports = handler