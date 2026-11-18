const axios = require("axios");
const {
  sendButtons
} = require("gifted-btns");
const config = require("../../config");
module.exports = {
  'name': 'shorturl',
  'aliases': ["shortlink"],
  'category': 'tools',
  'description': "Create a short URL from a long link",
  'usage': ".shorturl <url>",
  async 'execute'(v1, v2, v3, v4) {
    try {
      const v5 = v3.join(" ").trim();
      if (!v5) {
        return v4.reply("âŒ Please provide a link to shorten!\nExample:\n.shorturl https://google.com");
      }
      await v1.sendMessage(v4.from, {
        'react': {
          'text': "â³",
          'key': v2.key
        }
      });
      const {
        data: v6
      } = await axios.get("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(v5));
      await v1.sendMessage(v4.from, {
        'react': {
          'text': "âœ…",
          'key': v2.key
        }
      });
      const v7 = " *Short URL Created*\n\n" + (" *Original:* " + v5 + "\n") + (" *Shortened:* " + v6);
      await sendButtons(v1, v4.from, {
        'text': v7,
        'footer': "> Powered by " + config.botName,
        'buttons': [{
          'name': "cta_url",
          'buttonParamsJson': JSON.stringify({
            'display_text': "Open Link",
            'url': v6
          })
        }, {
          'name': 'cta_copy',
          'buttonParamsJson': JSON.stringify({
            'display_text': "‹ Copy URL",
            'copy_code': v6
          })
        }]
      }, {
        'quoted': v2
      });
    } catch (v8) {
      console.error("SHORTLINK ERROR:", v8);
      await v1.sendMessage(v4.from, {
        'react': {
          'text': "âŒ",
          'key': v2.key
        }
      });
      await v4.reply("âŒ Failed to create shortlink: " + (v8.message || v8));
    }
  }
};
