/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} beautiful dance`)
    }

    try {
        const url = `${global.APIs.deline}/search/douyin?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status) throw 'API error'

        await conn.sendFile(
            m.chat,
            data.video,
            'douyin.mp4',
            data.caption,
            m
        )

    } catch (e) {
        console.error(e)
        m.reply('Failed searching video Douyin.')
    }
}

handler.help = ['douyinsearch <query>']
handler.tags = ['search']
handler.command = /^douyinsearch$/i
handler.limit = true
module.exports = handler