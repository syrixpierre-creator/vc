const axios = require("axios");
const config = require("../../config");
function getVideoFile(v1) {
  return v1?.['video_files']?.["filter"](v2 => v2?.['link'])?.["sort"]((v3, v4) => (v4.width || 0) - (v3.width || 0))[0]?.["link"];
}
module.exports = {
  'name': 'videogen',
  'aliases': ["vgen"],
  'category': "aivideo",
  'description': "Fetch a short video from a keyword",
  'usage': (config.prefix || '.') + "videogen <keyword>",
  async 'execute'(v5, v6, v7, v8 = {}) {
    const v9 = v6.key.remoteJid;
    const v10 = v8.prefix || config.prefix || '.';
    const v11 = v7.join(" ").trim();
    await v5.sendMessage(v9, {
      'react': {
        'text': '⏳',
        'key': v6.key
      }
    });
    if (!v11) {
      return v5.sendMessage(v9, {
        'text': "🎬 Video generator\n\nUsage: " + v10 + "videogen <keyword>\nExample: " + v10 + "videogen wolf anime"
      }, {
        'quoted': v6
      });
    }
    const v12 = process.env.PEXELS_API_KEY?.["trim"]();
    if (!v12) {
      return v5.sendMessage(v9, {
        'text': "❌ Video search is not configured. Add `PEXELS_API_KEY` to the June-X environment before using this command."
      }, {
        'quoted': v6
      });
    }
    try {
      const v13 = await axios.get('https://api.pexels.com/videos/search', {
        'params': {
          'query': v11,
          'per_page': 0x3
        },
        'headers': {
          'Authorization': v12
        },
        'timeout': 0x7530
      });
      const v14 = v13.data?.["videos"] || [];
      if (!v14.length) {
        return v5.sendMessage(v9, {
          'text': "❌ No videos found for \"" + v11 + "\"."
        }, {
          'quoted': v6
        });
      }
      const v15 = getVideoFile(v14[Math.floor(Math.random() * v14.length)]);
      if (!v15) {
        throw new Error("The video service returned no playable file");
      }
      await v5.sendMessage(v9, {
        'video': {
          'url': v15
        },
        'caption': "🎬 Video result for: \"" + v11 + "\"\n" + (config.botName || "JuneX-Ultra") + " Video"
      }, {
        'quoted': v6
      });
    } catch (v16) {
      console.error("[VIDEOGEN] Error:", v16);
      await v5.sendMessage(v9, {
        'text': "⚠️ Failed to fetch video: " + v16.message
      }, {
        'quoted': v6
      });
    }
  }
};
