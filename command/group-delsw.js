/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply('📌 Reply status group that ingin dihapus!\n\nContoh: .delswgc (reply status)')

    try {
        await conn.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.quoted.id,
                participant: m.quoted.sender,
            }
        })

        return m.reply('✅ Status success dihapus!')
    } catch (e) {
        console.error('Error:', e)
        return m.reply('❌ Failed menghapus status.\n\nPastikan bot adalah admin group and reply ke message status that correct.')
    }
}

handler.command = ['delswgc']
handler.admin = true
module.exports = handler