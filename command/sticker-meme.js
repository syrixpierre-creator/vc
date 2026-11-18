/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Name : Smeme
Type : Plugins Esm
Sumber : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
*/
const { Sticker } = require('wa-sticker-formatter');
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const FormData = ((__i)=>__i&&__i.default?__i.default:__i)(require('form-data'));
const fs = ((__i)=>__i&&__i.default?__i.default:__i)(require('fs'));
const path = ((__i)=>__i&&__i.default?__i.default:__i)(require('path'));
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

async function uguu(filePath) {
  try {
    const form = new FormData()
    form.append('files[]', fs.createReadStream(filePath))
    const { data } = await axios.post('https://uguu.se/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    })
    return data.files[0].url
  } catch (err) {
    throw new Error(err.message)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let [atas, bawah] = text.split`|`
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""
  if (!mime)
    throw `Reply to media with command\n\n${usedPrefix + command} <text atas>|<text bawah>`
  m.react("🕒")
  let mediaBuffer = await q.download()

  let ext = mime.split('/')[1] || "png"
  let tempFile = path.join(process.cwd(), `temp_${Date.now()}.${ext}`)
  fs.writeFileSync(tempFile, mediaBuffer)

  try {
    let url = await uguu(tempFile)

    if (mime.startsWith("image/")) {
      let meme = `https://api.memegen.link/images/custom/${encodeURIComponent(atas || " ")}/${encodeURIComponent(bawah || " ")}.png?background=${url}`
      let stiker = await createSticker(meme, false, "", "")
      await conn.sendFile(m.chat, stiker, "", "", m, "")
    } else {

      let stiker = await createSticker(url, false, "", "")
      await conn.sendFile(m.chat, stiker, "", "", m, "")
    }
  } finally {
    fs.unlinkSync(tempFile)
  }
}

handler.help = ["smeme <teks atas>|<teks bawah>"]
handler.tags = ["sticker"]
handler.command = /^(smeme)$/i
handler.limit = true
module.exports = handler

async function createSticker(img, url, packName, authorName, quality) {
  let stickerMetadata = {
    type: "full",
    pack: "Ryo Yamada - MD",
    author: "By HILMAN",
    quality: quality || 100
  }
  return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}