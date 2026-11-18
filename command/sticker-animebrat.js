/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*

# Fitur : Sticker Animebrat
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
# Api : https://fastrestapis.fasturl.cloud

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));
const sharp = ((__i)=>__i&&__i.default?__i.default:__i)(require('sharp'));

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Enter text for stiker.');

    try {
        const apiUrl = `https://fastrestapis.fasturl.cloud/maker/animbrat?text=${encodeURIComponent(text)}&position=center&mode=image`;
        const response = await fetch(apiUrl);
        const buffer = await response.arrayBuffer();

        // Konversi ke format webp agar bisa digunakan di WhatsApp
        const webpBuffer = await sharp(Buffer.from(buffer))
            .toFormat('webp')
            .toBuffer();

        await conn.sendMessage(m.chat, {
            sticker: webpBuffer
        }, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply('An error occurred saat membuat stiker.');
    }
};

handler.command = ['animebrat'];
handler.help = ['animebrat <teks>'];
handler.tags = ['sticker'];
handler.limit = true
module.exports = handler;