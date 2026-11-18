/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
* Nama Fitur : Tools image
* Type : Plugin Esm
* Sumber : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
* Sumber Skrep : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
* Author : ZenzzXD
*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const cheerio = ((__i)=>__i&&__i.default?__i.default:__i)(require('cheerio'));
const FormData = ((__i)=>__i&&__i.default?__i.default:__i)(require('form-data'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const _type = ['removebg', 'enhance', 'upscale', 'restore', 'colorize']

    if (!text) {
        throw `List Tools Image :\n\n> removebg\n> enhance\n> upscale\n> restore\n> colorize\n\ncontoh penggunaan :\n.imgtools removebg`
    }
    if (!_type.includes(text)) {
        throw `lu masukin tipe apa sih bree?\n\nList tools image :\n> ${_type.join('\n> ')}`
    }

    let buffer
    if (m.quoted && m.quoted.mimetype?.includes('image')) {
        buffer = await m.quoted.download()
    } else if (m.mimetype?.includes('image')) {
        buffer = await m.download()
    } else {
        throw `replay image with caption : .imgtools ${text}`
    }

    m.reply('wettt')
    try {
        const form = new FormData()
        form.append('file', buffer, `${Date.now()}.jpg`)
        form.append('type', text)

        const res = await axios.post('https://imagetools.rapikzyeah.biz.id/upload', form, {
            headers: form.getHeaders()
        })

        const $ = cheerio.load(res.data)
        const resultUrl = $('img#memeImage').attr('src')

        if (!resultUrl) throw 'gaada result yg found'

        await conn.sendFile(m.chat, resultUrl, 'hasil.jpg', '', m)
    } catch (e) {
        throw `Eror kak : ${e.message}`
    }
}

handler.help = ['imgtools <type>']
handler.tags = ['tools']
handler.command = ['imgtools']
handler.limit = true
handler.register = true
module.exports = handler