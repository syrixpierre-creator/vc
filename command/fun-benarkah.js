/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
// Jangan buly saya om saya cuma bercanda:)


let handler = async (m, { conn, text }) => {
  conn.reply(m.chat, `
*Pertanyaan:* ${m.text}
*Jawaban:* ${pickRandom(['Iya','Already pasti','Already pasti can','Tidak','Tentu not','Already pasti not'])}
`.trim(), m, {quoted:{key : {participant : '0@s.whatsapp.net'},message: {documentMessage: {title: wm,jpegThumbnail: Buffer.alloc(0)}}}})
}
handler.help = ['benarkah'].map(v => v + ' <text>')
handler.tags = ['fun']
handler.command = /^benarkah/i
handler.owner = false
module.exports = handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

