/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, text }) => {
  let [name, quote] = text.split('|').map(v => v.trim())
  if (!name || !quote) {
    throw 'Penggunaan: .fakexnxx <nama> | <quote>\nContoh: .fakexnxx zenn | Hai nama saya zen.'
  }

  let apiUrl = `https://api.siputzx.my.id/api/m/fake-xnxx?name=${encodeURIComponent(name)}&quote=${encodeURIComponent(quote)}&likes=999`

  let res = await fetch(apiUrl)
  let contentType = res.headers.get('content-type')

  if (contentType.includes('application/json')) {
    let json = await res.json()
    if (!json.status) throw json.error || 'Failed membuat image.'
    if (!json.result?.url) throw 'Failed mendapatkan URL image.'

    await conn.sendMessage(m.chat, {
      image: { url: json.result.url },
      caption: `Selesai!\n\nNama: ${name}\nQuote: ${quote}`,
      contextInfo: {
        externalAdReply: {
          title: 'Fake XNXX',
          body: name,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: apiUrl
        }
      }
    }, { quoted: m })
  } else {
    await conn.sendMessage(m.chat, {
      image: { url: apiUrl },
      caption: `Selesai!\n\nNama: ${name}\nQuote: ${quote}`,
      contextInfo: {
        externalAdReply: {
          title: 'Fake XNXX',
          body: name,
          mediaType: 1,
          renderLargerThumbnail: false,
          sourceUrl: apiUrl
        }
      }
    }, { quoted: m })
  }
}

handler.help = ['fakexnxx <nama> | <quote>']
handler.tags = ['maker']
handler.command = /^fakexnxx$/i
module.exports = handler