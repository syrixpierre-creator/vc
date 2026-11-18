/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'tebakgambar-' + m.chat
    if (!(id in conn.game)) throw false
    let json = conn.game[id][1]
    m.reply('Clue : ' + '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```' + '\n\n_*Jangan Reply to Chat This Tapi Reply to Soalnya*_')
}
handler.command = /^hgamb$/i
handler.limit = true
module.exports = handler