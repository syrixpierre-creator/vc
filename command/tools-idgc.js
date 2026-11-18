/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn, text }) => {
  if (!text) throw 'Enter link group WhatsApp!'

  const match = text.match(/(?:https?:\/\/)?chat\.whatsapp\.com\/([0-9A-Za-z]+)/i)
  if (!match) throw 'Link group WhatsApp invalid!'

  const code = match[1]

  try {
    const info = await conn.groupGetInviteInfo(code)

    const created = info.creation
      ? new Date(info.creation * 1000).toLocaleString('id-ID')
      : '-'

    const caption = `
— INFO GRUP —

❀ Nama: ${info.subject}
❀ ID Grup: ${info.id}
❀ Member: ${info.size || 0}
❀ Dibuat: ${created}
`.trim()

    m.reply(caption)
  } catch (e) {
    console.error(e)
    throw 'Failed mengambil info group. Pastikan link invite masih valid.'
  }
}

handler.help = ['cekidgc']
handler.tags = ['tools']
handler.command = /^(cekidgc|idgc)$/i
module.exports = handler