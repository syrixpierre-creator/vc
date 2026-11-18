/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const ffmpeg = ((__i)=>__i&&__i.default?__i.default:__i)(require('fluent-ffmpeg'));
const { tmpdir } = require('os');
const { join } = require('path');
const { createWriteStream, unlinkSync, existsSync, mkdirSync } = require('fs');

const runFFmpeg = (input, output, speed) => {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioFilters(`atempo=${speed}`)
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", () => resolve(output))
      .on("error", (err) => reject(err))
      .save(output)
  })
}

let handler = async (m, { conn, text }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""

  if (!/audio/.test(mime)) return m.reply("Reply to audio/vn that mau diubah temponya!\nContoh: .tempo 1.5")

  let speed = parseFloat(text)
  if (isNaN(speed) || speed < 0.5 || speed > 2.5) {
    return m.reply("Enter angka kecepatan 0.5 – 2.5\nContoh: .tempo 0.8 (lambat) | .tempo 2.0 (cepat)")
  }

  const wait = await conn.sendMessage(m.chat, { text: "Currently process tempo..." }, { quoted: m })

  let buffer
  try {
    buffer = await q.download()
  } catch {
    return conn.sendMessage(m.chat, { edit: wait.key, text: "Failed download audio!" })
  }

  const tmp = join(tmpdir(), "tempo")
  if (!existsSync(tmp)) mkdirSync(tmp, { recursive: true })

  const input = join(tmp, `in_${Date.now()}.mp3`)
  const output = join(tmp, `out_${Date.now()}.mp3`)

  try {
    createWriteStream(input).write(buffer)
    await runFFmpeg(input, output, speed)

    await conn.sendMessage(m.chat, {
      audio: { url: output },
      ptt: false,
      mimetype: "audio/mpeg",
      fileName: "tempo.mp3",
      waveform: [0, 20, 40, 60, 80, 60, 40, 20, 0]
    }, { quoted: m })

    await conn.sendMessage(m.chat, { delete: wait.key })
  } catch (e) {
    console.log(e)
    await conn.sendMessage(m.chat, { edit: wait.key, text: "Failed ubah tempo!" })
  } finally {
    [input, output].forEach(f => existsSync(f) && unlinkSync(f))
  }
}

handler.help = ["tempo <0.5-2.5>"]
handler.tags = ["voice"]
handler.command = /^tempo$/i
handler.limit = true
module.exports = handler