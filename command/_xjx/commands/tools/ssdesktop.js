const axios = require('axios');
const config = require("../../config");
const VIEWPORTS = ["desktop", "mobile"];
module.exports = {
  'name': "ssdsktp",
  'aliases': ["screenshot", "capture", 'ssdesktop'],
  'category': "tools",
  'description': "Take a screenshot of a website",
  'usage': ".ss <url> [desktop | mobile]",
  async 'execute'(v1, v2, v3, v4) {
    try {
      const v5 = v3[0];
      const v6 = VIEWPORTS.includes(v3[1]?.["toLowerCase"]()) ? v3[1].toLowerCase() : "desktop";
      if (!v5) {
        return v4.reply("📸 Provide a URL to screenshot!\n\nUsage: `.ss <url> [desktop | mobile]`\nExample: `.ss https://google.com mobile`");
      }
      const v7 = v5.startsWith("http") ? v5 : "https://" + v5;
      await v1.sendMessage(v4.from, {
        'react': {
          'text': '⏳',
          'key': v2.key
        }
      });
      const v8 = await axios.get('https://snapshot.xwolf.space/api/capture', {
        'params': {
          'siteUrl': v7,
          'viewport': v6
        },
        'responseType': "arraybuffer",
        'timeout': 0xea60
      });
      const v9 = Buffer.from(v8.data);
      if (!v9 || v9.length === 0) {
        await v1.sendMessage(v4.from, {
          'react': {
            'text': '❌',
            'key': v2.key
          }
        });
        return v4.reply("❌ Failed to capture. Site may be unreachable.");
      }
      const v10 = v8.headers["content-type"] || "image/png";
      await v1.sendMessage(v4.from, {
        'image': v9,
        'mimetype': v10,
        'caption': "📸 *" + v7 + "*\n📱 Viewport: " + v6 + "\n\n> " + config.botName
      }, {
        'quoted': v2
      });
      await v1.sendMessage(v4.from, {
        'react': {
          'text': '✅',
          'key': v2.key
        }
      });
    } catch (v11) {
      console.error("[SS] error:", v11.message);
      await v1.sendMessage(v4.from, {
        'react': {
          'text': '❌',
          'key': v2.key
        }
      });
      let v12 = "❌ Failed to capture: " + v11.message;
      if (v11.code === 'ECONNABORTED') {
        v12 = "❌ Request timed out. The site took too long to load.";
      } else {
        if (v11.response?.["status"] === 400) {
          v12 = "❌ Invalid URL. Please check and try again.";
        } else {
          if (v11.response?.["status"] === 500) {
            v12 = "❌ API server error. Try again later.";
          }
        }
      }
      await v4.reply(v12);
    }
  }
};
