/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} lookism`)
    }

    try {
        const url = `${global.APIs.deline}/search/webtoon?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status || !data.result.original.length) {
            throw 'Webtoon not found'
        }

        const w = data.result.original[0]

        const img = await axios.get(w.image, {
            responseType: 'arraybuffer',
            headers: {
                Referer: 'https://www.webtoons.com/'
            }
        })

        const caption = `📚 *${w.title}*
👤 Author: ${w.author}
👁️ ${w.viewCount}
🔗 ${w.link}`

        await conn.sendFile(m.chat, img.data, 'webtoon.jpg', caption, m)

    } catch (e) {
        console.error(e)
        m.reply('Failed searching Webtoon.')
    }
}

handler.help = ['webtoonsearch <judul>']
handler.tags = ['search']
handler.command = /^webtoonsearch$/i
handler.limit = true
module.exports = handler