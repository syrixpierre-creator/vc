/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'tebaktebakan-' + m.chat
    if (!(id in conn.game)) return
    let json = conn.game[id][1]
    m.reply('Clue : ' + '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```' + '\n\n_*Jangan Reply to Chat This Tapi Reply to Soalnya*_')
}
handler.command = /^hkan$/i
handler.limit = true
module.exports = handler