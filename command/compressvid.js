/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fs = ((__i)=>__i&&__i.default?__i.default:__i)(require('fs'));
const path = ((__i)=>__i&&__i.default?__i.default:__i)(require('path'));
const os = ((__i)=>__i&&__i.default?__i.default:__i)(require('os'));
const ffmpeg = ((__i)=>__i&&__i.default?__i.default:__i)(require('fluent-ffmpeg'));
const sharp = ((__i)=>__i&&__i.default?__i.default:__i)(require('sharp'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) throw `Reply media + mode:\n\n${usedPrefix + command} auto|hd|ultra`

    let mode = (text || 'auto').toLowerCase()
    let media = await q.download()
    let tmp = path.join(os.tmpdir(), +new Date + '')

    // ================= IMAGE =================
    if (/image/.test(mime)) {
      let out = tmp + '.jpg'

      let quality = 80
      if (mode === 'hd') quality = 95
      if (mode === 'ultra') quality = 40

      await sharp(media)
        .jpeg({ quality, mozjpeg: true })
        .toFile(out)

      await conn.sendFile(m.chat, out, 'compressed.jpg',
        `✅ Selesai (Mode: ${mode.toUpperCase()})`, m)

      fs.unlinkSync(out)
    }

    // ================= VIDEO =================
    else if (/video/.test(mime)) {
      let input = tmp + '.mp4'
      let output = tmp + '_compressed.mp4'

      fs.writeFileSync(input, media)

      let crf = 28
      let scale = '640:-2'

      if (mode === 'hd') {
        crf = 23
        scale = '854:-2'
      }

      if (mode === 'ultra') {
        crf = 35
        scale = '480:-2'
      }

      await new Promise((resolve, reject) => {
        ffmpeg(input)
          .outputOptions([
            `-crf ${crf}`,
            '-preset veryfast',
            '-vcodec libx264',
            '-acodec aac',
            '-b:a 96k',
            `-vf scale=${scale}`
          ])
          .save(output)
          .on('end', resolve)
          .on('error', reject)
      })

      await conn.sendFile(m.chat, output, 'compressed.mp4',
        `✅ Selesai (Mode: ${mode.toUpperCase()})`, m)

      fs.unlinkSync(input)
      fs.unlinkSync(output)
    }

    else {
      throw 'Format not didukung'
    }

  } catch (e) {
    m.reply('❌ Error: ' + e)
  }
}

handler.help = ['compress auto', 'compress hd', 'compress ultra']
handler.tags = ['tools']
handler.command = /^(compress|kompres)$/i
handler.limit = true
module.exports = handler