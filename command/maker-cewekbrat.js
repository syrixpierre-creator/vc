/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} Halo hilman`)
    }

    const url = `${global.APIs.deline}/maker/cewekbrat?text=${encodeURIComponent(text)}`

    try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer' })
        await conn.sendFile(m.chat, data, 'cewekbrat.jpg', '', m)
    } catch (e) {
        console.error(e)
        m.reply('Failed membuat image cewek brat.')
    }
}

handler.help = ['cewekbrat <teks>']
handler.tags = ['maker']
handler.command = /^cewekbrat$/i
handler.limit = true
module.exports = handler