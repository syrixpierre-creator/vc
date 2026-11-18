/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const FormData = ((__i)=>__i&&__i.default?__i.default:__i)(require('form-data'));

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image/.test(mime)) {
        return m.reply(`Reply image with caption\n${usedPrefix + command}`)
    }

    try {
        await m.reply('⏳ Processing...')

        const buffer = await q.download()
        if (!buffer) throw new Error('Failed download image')

        const form = new FormData()
        form.append('image', buffer, {
            filename: 'image.jpg',
            contentType: mime
        })

        const url = 'https://api.theresav.biz.id/image/tomanga?apikey=qKdov&style=Ubah+foto+menjadi+ilustrasi+manga+Jepang+hitam+putih'

        const res = await axios.post(url, form, {
            headers: form.getHeaders(),
            responseType: 'arraybuffer'
        })

        const result = Buffer.from(res.data)

        if (!result || result.length < 1000) {
            throw new Error('Result image invalid')
        }

        await conn.sendMessage(m.chat, {
            image: result,
            caption: '📚 Done convert manga'
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        await m.reply(`❌ Error: ${e.message}`)
    }
}

handler.help = ['tomanga']
handler.tags = ['image']
handler.command = /^(tomanga|manga)$/i
handler.register = true
handler.limit = true
module.exports = handler