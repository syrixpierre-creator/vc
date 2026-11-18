/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
  Tolong Jangan Pernah Hapus Watermark Ini
  Script By : JazxCode
  Name Script : Interindah - Assistant MD
  Version : V1.0
  Follow Saluran : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
*/

const handler = async (m, { text }) => {
    if (!text) return m.reply("🍌 Harap enter link channel WhatsApp!");
    if (!text.includes("https://whatsapp.com/channel/")) return m.reply("Link tautan invalid!");

    let result = text.split("https://whatsapp.com/channel/")[1];
    let res = await conn.newsletterMetadata("invite", result);

    let teks = `
*✨ ID:* ${res.id}
`;

    return m.reply(teks);
};

handler.help = ["cekidch"]
handler.tags = ["tools"]
handler.command = ["cekidch", "idch"];
module.exports = handler;