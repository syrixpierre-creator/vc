/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/**
 *  Loli - Random
 * • Type   : Plugin ESM
 * • Source : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
 * • C by   : SXZnightmare
 * • API    : https://api.nekorinn.my.id
 */

let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
  try {
    let url = 'https://api.nekorinn.my.id/random/loli'
    await conn.sendFile(m.chat, url, 'loli.jpg', '🍬 *Nih lolinya*', m)
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: '❌ *Failed mengambil image, try again nanti ya kakak~*',
      quoted: m
    })
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  }
}

handler.help = ['loli2']
handler.command = /^(loli2)$/i
handler.tags = ['anime']
handler.limit = true
handler.register = true
module.exports = handler