/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn, text, usedPrefix, command }) => {
    const example = `Silahkan masukan laporan You\nContoh : ${usedPrefix + command} There is bug di bot`.trim();
    if (!text) throw example;
    if (text.length > 100) throw "Teks terlalu panjang! Maksimal 100 karakter.";

    const report = `* LAPOR *\n\nPesan: ${text}\nDari: *@${m.sender.split`@`[0]}*`;
    conn.reply("6285523568687@s.whatsapp.net", report.trim(), m);
    await m.reply(`[ ✔️ ] Laporan success dikirim. Please tunggu balasan from Owner.`);
};

handler.help = ["lapor"];
handler.tags = ["info"];
handler.command = /^lapor$/i;
module.exports = handler;