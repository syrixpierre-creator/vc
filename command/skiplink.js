/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

const handler = async (m, { text }) => {
  if (!text) {
    return m.reply(`Example:\n.skiplink https://sfl.gl/`)
  }

  try {
    const { data } = await axios.get(
      'https://free-restapi.biz.id/api/skiplink',
      {
        params: {
          url: text,
          apikey: 'KaaOffc2'
        }
      }
    )

    if (!data.success) {
      throw new Error(data.info?.message || 'Failed bypass')
    }

    const hasil = data.directUrl

    await m.reply(
`✅ *Bypass Berhasil*

📌 Type: ${data.type || '-'}
🔗 Direct URL:
${hasil}`
    )

  } catch (err) {
    console.error(err)
    m.reply(`❌ Error: ${err.message}`)
  }
}

handler.help = ['skiplink <url>']
handler.tags = ['tools']
handler.command = ['skiplink']
module.exports = handler