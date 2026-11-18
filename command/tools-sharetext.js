/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
 • Fitur By Anomaki Team
 • Created : xyzan code
 • Share teks *(Plugins)*
 • Jangan Hapus Wm
 • https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

const handler = async (m, {
    conn,
    text
}) => {
    if (!text) throw 'Kasih text that mau dishare dong...';

    try {
        const link = await bikinLink(text);
        await conn.reply(m.chat, `Nih link teks lu: ${link}`, m);
    } catch (e) {
        await conn.reply(m.chat, `Waduh error: ${e}`, m);
    }
};

handler.help = ['shareteks teks'];
handler.tags = ['tools'];
handler.command = /^(shareteks|bagiteks)$/i;
handler.limit = true;
module.exports = handler;

const bikinLink = async (teks) => {
    const {
        data
    } = await axios.post('https://sharetext.io/api/text', {
        text: teks
    }, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://sharetext.io/'
        }
    });

    if (!data) throw 'Failed bikin link';
    return `https://sharetext.io/${data}`;
};

// kok simple bang? Ya emng gini simple webnya 😹