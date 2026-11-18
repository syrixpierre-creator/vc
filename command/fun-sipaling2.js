/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/* JANGAN HAPUS INI
SCRIPT BY © VYNAA VALERIE
•• recode kasih credits
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie
•• (github.com/VynaaValerie)
*/
let handler = async (m, { conn, command, usedPrefix, text, groupMetadata }) => {
    if (!text) throw `Example:\n${usedPrefix + command} ganteng`

    // Array emoji lebih variatif
    let emojis = ['😀', '😂', '😎', '🤔', '🤩', '😜', '🙃', '😏', '🥳', '🥴', '😇', '🫡', '😡']
    let praises = [
        "Luar biasa banget! 😍",
        "Nggak ada lawannya! 🤯",
        "Beneran juara! 🏆",
        "Sungguh fenomenal! 🚀",
        "Mantap kali! 💥",
        "Top banget deh! 🥳",
    ]

    let toMention = a => '@' + a.split('@')[0]
    let participants = groupMetadata.participants.map(v => v.id)
    let selectedParticipant = participants.getRandom()
    let randomEmoji = emojis.getRandom()
    let randomPraise = praises.getRandom()

    conn.reply(
        m.chat,
        `That *paling ${text}* adalah ${toMention(selectedParticipant)} ${randomEmoji}\n${randomPraise}`,
        m,
        { mentions: [selectedParticipant] }
    )
}

handler.help = ['sipaling'].map(v => v + ' <teks>')
handler.command = ['sipaling']
handler.tags = ['fun']

handler.group = true
module.exports = handler