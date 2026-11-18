/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*

# Fitur : voice-prabowo
# Type : Plugins ESM
# Convert by : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
# Case by : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
# Api : https://aihub.xtermai.xyz

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!text) {
        return m.reply(`*Example:* ${usedPrefix + command} Halo pak, perkenalkan dirimu`);
    }

    try {
        const message = text.trim();

        let prompt = `Name you adalah Prabowo Subianto, seorang pria that tegas, penuh wibawa, berbicara with serius and percaya diri. Tanggapi message berikut with penuh keyakinan: "${message}"`;

        const requestData = { content: message, user: m.sender, prompt: prompt };

        let response = await axios.post('https://luminai.my.id', requestData);
        let generatedText = response.data?.result?.trim() || '';

        console.log('Generated Text:', generatedText)

        if (!generatedText) generatedText = message;
        if (generatedText.length > 250) generatedText = generatedText.slice(0, 250);

        const ttsUrl = `https://aihub.xtermai.xyz/api/text2speech/elevenlabs?text=${encodeURIComponent(generatedText)}&key=Bell409&voice=prabowo`;
        const audioResponse = await fetch(ttsUrl);

        if (!audioResponse.ok) throw new Error('Failed mengambil audio TTS');

        const audioBuffer = await audioResponse.arrayBuffer();

        await conn.sendMessage(m.chat, { audio: Buffer.from(audioBuffer), mimetype: 'audio/mpeg', ptt: true }, { quoted: m });

    } catch (err) {
        console.error('❌ Error\nLogs error:', err);
        m.reply('❌ Error\nTerjadi kesalahan saat memproses permintaan anda.');
    }
}

handler.help = ['prabowo']
handler.tags = ['ai']
handler.command = /^prabowo$/i
handler.limit = true
handler.register = true
module.exports = handler