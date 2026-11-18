/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/**

      ⧉  [whatmusic] — [tools]


  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
  ✺ Creator  : SXZnightmare
  ✺ Scrape      :
  [ https://gist.github.com/ZenzzXD/3bab320795a91d75c6dadffdfadb7041 ]
  [ https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J/3177 ]
  ✺ Scrape Maker : [ Zenz ]
*/

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!/audio/.test(mime)) return m.reply(`*Example: reply audio with command ${usedPrefix + command}*`)
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        let media = await q.download()
        let form = new FormData()
        form.append('file', new Blob([media]), 'audio.mp3')
        form.append('sample_size', '118784')

        let res = await fetch('https://api.doreso.com/humming', {
            method: 'POST',
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
                'accept': 'application/json, text/plain, */*',
                'origin': 'https://www.aha-music.com',
                'referer': 'https://www.aha-music.com/'
            },
            body: form
        })

        let json = await res.json()

        if (!json?.data?.title) {
            return m.reply(`*🍂 Failed Mendeteksi Musik*`)
        }

        let hasil = `
*🎵 WHAT MUSIC DETECTED*
*🎤 Artist:* ${json.data.artists || 'Not Diketahui'}
*🎧 Title:* ${json.data.title || 'Not Diketahui'}
*🆔 Track ID:* ${json.data.acrid}
`.trim()

        await m.reply(hasil)

    } catch (e) {
        m.reply(`*🍂 An error occurred Saat Mendeteksi Musik*`)
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    }
}

handler.help = ['whatmusic'];
handler.tags = ['tools'];
handler.command = /^(whatmusic|whatmusik|wmusic)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.
module.exports = handler