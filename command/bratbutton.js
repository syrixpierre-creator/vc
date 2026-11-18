/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/* fitur brat button
follow bang https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
© rijalganzz not sepuh
type esm plugins ya bang
tinggal sesuaikan sama punya mu
*/
const { Sticker } = require('wa-sticker-formatter');

let handler = async (m, { conn, text }) => {
    let teksMasukan = m.quoted?.text || text || '';
    if (!teksMasukan) return m.reply('Reply to message or berikan text.');

    try {
        const buttonMessage = {
            text: teksMasukan,
            footer: 'Pilih tombol di bawah',
            buttons: [
                { buttonId: `.brat ${teksMasukan}`, buttonText: { displayText: 'Brat' }, type: 1 },
                { buttonId: `.bratvid ${teksMasukan}`, buttonText: { displayText: 'Brat Video' }, type: 1 },
                { buttonId: `.animebrat ${teksMasukan}`, buttonText: { displayText: 'Brat Anime' }, type: 1 }
            ],
            headerType: 1
        };

        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });

    } catch (error) {
        console.error('Kesalahan saat mengirim pesan tombol:', error);
        m.reply('An error occurred. Please try again.');
    }
};

handler.help = ['bratb'];
handler.tags = ['tools'];
handler.command = /^bratb$/i;
module.exports = handler;