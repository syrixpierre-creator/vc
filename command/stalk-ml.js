/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const fs = ((__i)=>__i&&__i.default?__i.default:__i)(require('fs/promises'));

async function getToken(url) {
  try {
    const response = await axios.get(url);
    const cookies = response.headers["set-cookie"];
    const joinedCookies = cookies ? cookies.join("; ") : null;

    const csrfTokenMatch = response.data.match(/<meta name="csrf-token" content="(.*?)">/);
    const csrfToken = csrfTokenMatch ? csrfTokenMatch[1] : null;

    if (!csrfToken || !joinedCookies) {
      throw new Error("Failed mendapatkan CSRF token or cookie.");
    }

    return { csrfToken, joinedCookies };
  } catch (error) {
    console.error("❌ Error fetching cookies or CSRF token:", error.message);
    throw error;
  }
}

async function mlStalk(userId, zoneId) {
  try {
    const { csrfToken, joinedCookies } = await getToken("https://www.gempaytopup.com");

    const payload = {
      uid: userId,
      zone: zoneId,
    };

    const { data } = await axios.post(
      "https://www.gempaytopup.com/stalk-ml",
      payload,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "application/json",
          Cookie: joinedCookies,
        },
      }
    );

    return data;
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Response:", error.response?.data || "No response data");
  }
}

// Handler untuk command
const handler = async (m, { conn, text }) => {
  const [userId, zoneId] = text.split(' '); // Mengambil userId dan zoneId dari query

  if (!userId || !zoneId) {
    return m.reply("Silakan enter userId and zoneId. Example: .mlstalk 12345678 1234");
  }

  const result = await mlStalk(userId, zoneId);

  if (result) {
    // Format hasil yang lebih rapi
    const formattedResult = `
Username: ${result.username || 'Not available'}
Region: ${result.region || 'Not available'}
Success: ${result.success ? 'Ya' : 'Tidak'}
    `;

    // Ganti 'https://link.to/your/image.jpg' dengan URL gambar yang ingin Anda kirim
    const imageUrl = 'https://www.pic.surf/2kk';

    // Mengirim gambar dari URL dan hasil dalam satu pesan
    await conn.sendFile(m.chat, imageUrl, 'image.jpg', `Result Stalk:\n${formattedResult}`, m);
  } else {
    m.reply("Failed mendapatkan data.");
  }
};

handler.help = ['mlstalk <userId> <zoneId>'];
handler.tags = ["stalk"];
handler.command = /^(mlstalk)$/i;
handler.limit = false;
module.exports = handler;