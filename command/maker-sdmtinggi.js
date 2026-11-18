/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/**
 *  ToSdmTinggi (URL) - Maker
 * • Type   : Plugin ESM
 * • Source : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
 * • C by   : SXZnightmare
 * • API    : https://zenzxz.dpdns.org/
 */

let handler = async (m, { args, conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let url = args[0]
    if (!url || !/^https?:\/\//i.test(url)) {
      throw '*📸 Send command seperti this:*\n*.tosdmtinggi https://example.com/image.jpg*'
    }

    let api = `https://zenzxz.dpdns.org/maker/tosdmtinggi?url=${encodeURIComponent(url)}`
    let res = await fetch(api)
    if (!res.ok) throw '*⚠️ Failed processing image! Pastikan URL valid and image dapat diakses.*'

    let buffer = await res.arrayBuffer()
    await conn.sendMessage(m.chat, {
      image: Buffer.from(buffer),
      caption: '*✅ Sukses! Image lu udah diubah jadi SDM Tinggi* 😎',
      quoted: m
    })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: typeof e === 'string' ? e : '*❌ An error occurred internal saat processing image.*',
      quoted: m
    })
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  }
}

handler.help = ['tosdmtinggi']
handler.tags = ['maker']
handler.command = /^(tosdmtinggi|sdmtinggi)$/i
handler.limit = true
handler.register = true
module.exports = handler