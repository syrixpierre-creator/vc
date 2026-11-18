/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const https = ((__i)=>__i&&__i.default?__i.default:__i)(require('https'));
const { fileTypeFromBuffer } = require('file-type');

let handler = async (m, { usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) throw `❌ Send/Reply file with caption *${usedPrefix + command}*`

    m.reply('📤 *Uploading...*')

    try {
        let media = await q.download()

        let type = await fileTypeFromBuffer(media)
        let mimeFix = type?.mime || mime
        let ext = type?.ext || mime.split('/')[1] || 'bin'

        const config = {
            username: "hamm-r",
            repo: "uploader",
            folder: "",
            token: process.env.GITHUB_TOKEN || "", // Set GITHUB_TOKEN in .env; never hardcode tokens
            branch: "main"
        }

        let filename = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`
        let filePath = config.folder ? `${config.folder}/${filename}` : filename
        let contentBase64 = media.toString('base64')

        let apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${filePath}`

        const agent = new https.Agent({ family: 4 })

        await axios.put(apiUrl, {
            message: `Bot Upload: ${filename}`,
            content: contentBase64,
            branch: config.branch
        }, {
            httpsAgent: agent,
            headers: {
                "Authorization": `token ${config.token}`,
                "Content-Type": "application/json",
                "User-Agent": "Anya-MD"
            }
        })

        let rawUrl = `https://raw.githubusercontent.com/${config.username}/${config.repo}/${config.branch}/${filePath}`

        let caption = `✅ *Upload Success!*\n\n` +
            `📄 *File:* ${filename}\n` +
            `📦 *Type:* ${mimeFix}\n\n` +
            `🔗 *URL:*\n${rawUrl}`

        // 🔥 KIRIM URL DOANG
        m.reply(caption)

    } catch (e) {
        console.error(e)
        let errMsg = e.response?.data?.message || e.message
        m.reply(`❌ *Failed Upload!*\n\nServer: ${errMsg}`)
    }
}

handler.help = ['uploadgh', 'tourlgh']
handler.tags = ['tools', 'uploader']
handler.command = /^(uploadgh|tourlgh|ghupload)$/i
handler.limit = false
module.exports = handler