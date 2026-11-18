const axios = require("axios");
const yts = require("yt-search");
const config = require("../../config");
const fs = require('fs');
const path = require("path");
const os = require('os');
module.exports = {
  'name': "video3",
  'aliases': ["vid3", "ytv3", "mp4doc"],
  'category': "media",
  'description': "Download a YouTube video and send as document (MP4)",
  'usage': ".video3 <youtube url or search>",
  'ownerOnly': false,
  async 'execute'(v1, v2, v3, v4) {
    const v5 = v4.from;
    const v6 = v3.join(" ").trim();
    if (!v6) {
      return v4.reply("Usage: " + (config.prefix || '.') + "video3 <youtube url or search>");
    }
    await v4.react('⏳');
    let v7;
    try {
      const v8 = await yts(v6);
      const v9 = v8?.["videos"]?.[0];
      if (!v9) {
        throw new Error("No results found for that query");
      }
      const {
        title: v10,
        url: v11
      } = v9;
      const v12 = 'https://apiskeith2-production-3020.up.railway.app/download/video?url=' + encodeURIComponent(v11) + "&quality=best";
      const {
        data: v13
      } = await axios.get(v12, {
        'timeout': 0x7530
      });
      const v14 = v13?.["result"];
      if (!v14) {
        throw new Error("API did not return a download URL");
      }
      v7 = path.join(os.tmpdir(), "video3-" + Date.now() + '.mp4');
      const {
        data: v15
      } = await axios.get(v14, {
        'responseType': 'stream',
        'timeout': 0x2bf20,
        'maxRedirects': 0x5
      });
      await new Promise((v16, v17) => {
        const v18 = fs.createWriteStream(v7);
        v15.pipe(v18);
        v18.on('finish', v16);
        v18.on("error", v17);
        v15.on("error", v17);
      });
      const v19 = fs.statSync(v7);
      if (!v19 || v19.size === 0) {
        throw new Error("Download failed — file is empty");
      }
      const v20 = v10.replace(/[<>:"/\\|?*]/g, '').trim().slice(0, 80);
      await v1.sendMessage(v5, {
        'document': fs.readFileSync(v7),
        'mimetype': "video/mp4",
        'fileName': v20 + ".mp4"
      }, {
        'quoted': v2
      });
      await v4.react('✅');
    } catch (v21) {
      console.error("[video3]", v21.message);
      await v4.react('❌');
      await v4.reply("❌ " + v21.message);
    } finally {
      try {
        if (v7 && fs.existsSync(v7)) {
          fs.unlinkSync(v7);
        }
      } catch {}
    }
  }
};
