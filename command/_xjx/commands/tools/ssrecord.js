const axios = require("axios");
const config = require("../../config");
const VIEWPORTS = ["desktop", "mobile"];
module.exports = {
  'name': "ssrecord",
  'aliases': ['ssr', "webrecord", 'screenrecord'],
  'category': "tools",
  'description': "Record a website screen as a video",
  'usage': ".ssrecord <url> [desktop | mobile]",
  async 'execute'(v1, v2, v3, v4) {
    try {
      const v5 = v3[0];
      const v6 = VIEWPORTS.includes(v3[1]?.["toLowerCase"]()) ? v3[1].toLowerCase() : "desktop";
      if (!v5) {
        return v4.reply("🎥 Provide a URL to record!\n\nUsage: `.ssrecord <url> [desktop | mobile]`\nExample: `.ssrecord https://google.com mobile`");
      }
      const v7 = v5.startsWith("http") ? v5 : 'https://' + v5;
      await v1.sendMessage(v4.from, {
        'react': {
          'text': '⏳',
          'key': v2.key
        }
      });
      await v4.reply("🎥 Recording *" + v7 + "* on *" + v6 + "*...\nThis may take a few seconds.");
      const v8 = await axios.get('https://snapshot.xwolf.space/api/record', {
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
        return v4.reply("❌ Failed to record. Site may be unreachable.");
      }
      const v10 = (v9.length / 1048576).toFixed(2);
      await v1.sendMessage(v4.from, {
        'video': v9,
        'mimetype': "video/webm",
        'caption': "🎥 *" + v7 + "*\n📱 Viewport: " + v6 + "\n📦 Size: " + v10 + " MB\n\n> " + config.botName
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
      console.error("[SSRecord] error:", v11.message);
      await v1.sendMessage(v4.from, {
        'react': {
          'text': '❌',
          'key': v2.key
        }
      });
      let v12 = "❌ Failed to record: " + v11.message;
      if (v11.code === "ECONNABORTED") {
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
