const {
  downloadContentFromMessage
} = require('@whiskeysockets/baileys');
const {
  sendButtons
} = require("gifted-btns");
const fs = require('fs');
const path = require("path");
const axios = require('axios');
const FormData = require('form-data');
async function uploadToImgBB(v1, v2) {
  const v3 = await fs.promises.readFile(v1);
  const v4 = new FormData();
  v4.append("image", v3.toString("base64"));
  const v5 = process.env.IMGBB_API_KEY || "041e0067533623124cf24d5f1f1c7a71";
  if (!v5) {
    throw new Error("IMGBB_API_KEY not set");
  }
  const v6 = await axios.post("https://api.imgbb.com/1/upload?key=" + v5, v4, {
    'headers': v4.getHeaders(),
    'timeout': 0xea60
  });
  const v7 = v6.data?.['data']?.["url"];
  if (v7 && v7.startsWith("http")) {
    return v7;
  }
  throw new Error("ImgBB: no URL in response");
}
const MEDIA_HANDLERS = {
  'imageMessage': {
    'type': "image",
    'ext': ".jpg"
  },
  'videoMessage': {
    'type': "video",
    'ext': '.mp4'
  },
  'audioMessage': {
    'type': "audio",
    'ext': ".mp3"
  },
  'documentMessage': {
    'type': "document",
    'ext': null
  },
  'stickerMessage': {
    'type': "sticker",
    'ext': ".webp"
  }
};
async function extractMedia(v8) {
  for (const v9 in MEDIA_HANDLERS) {
    if (v8[v9]) {
      const {
        type: v10,
        ext: v11
      } = MEDIA_HANDLERS[v9];
      const v12 = await downloadContentFromMessage(v8[v9], v10);
      const v13 = [];
      for await (const v14 of v12) v13.push(v14);
      const v15 = Buffer.concat(v13);
      if (v9 === "documentMessage") {
        const v16 = v8.documentMessage.fileName || "file.bin";
        const v17 = path.extname(v16).toLowerCase() || ".bin";
        return {
          'buffer': v15,
          'ext': v17,
          'type': "document",
          'mime': v8.documentMessage.mimetype
        };
      }
      return {
        'buffer': v15,
        'ext': v11,
        'type': v10,
        'mime': v8[v9].mimetype
      };
    }
  }
  if (v8.documentWithCaptionMessage?.["message"]?.["documentMessage"]) {
    const v18 = v8.documentWithCaptionMessage.message.documentMessage;
    const v19 = await downloadContentFromMessage(v18, "document");
    const v20 = [];
    for await (const v21 of v19) v20.push(v21);
    const v22 = v18.fileName || "file.bin";
    const v23 = path.extname(v22).toLowerCase() || ".bin";
    return {
      'buffer': Buffer.concat(v20),
      'ext': v23,
      'type': "document",
      'mime': v18.mimetype
    };
  }
  return null;
}
module.exports = {
  'name': 'imgbb',
  'aliases': ["url", "imgbb", "tolink"],
  'category': 'tools',
  'description': "Upload media to get a direct URL (uses ImgBB only)",
  'usage': ".tourl (reply to media)",
  async 'execute'(v24, v25, v26, v27) {
    try {
      const v28 = v25.message?.["extendedTextMessage"]?.['contextInfo']?.["quotedMessage"];
      const v29 = v25.message;
      const v30 = v28 || v29;
      if (!v30) {
        return v27.reply("📎 Send or reply to a media (image, video, audio, sticker, document) to get a URL.");
      }
      const v31 = await extractMedia(v30);
      if (!v31) {
        return v27.reply("📎 Send or reply to a media (image, video, audio, sticker, document) to get a URL.");
      }
      await v24.sendMessage(v27.from, {
        'react': {
          'text': '🔄',
          'key': v25.key
        }
      });
      const v32 = path.join(__dirname, "../../temp");
      if (!fs.existsSync(v32)) {
        fs.mkdirSync(v32, {
          'recursive': true
        });
      }
      const v33 = path.join(v32, '' + Date.now() + v31.ext);
      fs.writeFileSync(v33, v31.buffer);
      const v34 = (v31.buffer.length / 1024 / 1024).toFixed(2);
      const v35 = "file" + v31.ext;
      try {
        await v24.sendMessage(v27.from, {
          'react': {
            'text': '⏫',
            'key': v25.key
          }
        });
        const v36 = await uploadToImgBB(v33, v35);
        await v24.sendMessage(v27.from, {
          'react': {
            'text': '✅',
            'key': v25.key
          }
        });
        const v37 = "📎 *Media URL* 📎\n\n" + ("🔗 *Link:* " + v36 + "\n") + "📤 *Via:* ImgBB\n" + ("📁 *Type:* " + v31.type + "\n") + ("📦 *Size:* " + v34 + " MB");
        await sendButtons(v24, v27.from, {
          'text': v37,
          'footer': "> Powered by " + require("../../config").botName,
          'buttons': [{
            'name': "cta_url",
            'buttonParamsJson': JSON.stringify({
              'display_text': "🔗 Open Link",
              'url': v36
            })
          }, {
            'name': "cta_copy",
            'buttonParamsJson': JSON.stringify({
              'display_text': "📋 Copy URL",
              'copy_code': v36
            })
          }]
        }, {
          'quoted': v25
        });
      } catch (v38) {
        await v24.sendMessage(v27.from, {
          'react': {
            'text': '❌',
            'key': v25.key
          }
        });
        console.error("[ImgBB Upload Error]", v38.message);
        await v24.sendMessage(v27.from, {
          'text': "❌ Upload failed: " + v38.message
        }, {
          'quoted': v25
        });
      } finally {
        setTimeout(() => {
          try {
            if (fs.existsSync(v33)) {
              fs.unlinkSync(v33);
            }
          } catch (v39) {}
        }, 2000);
      }
    } catch (v40) {
      console.error("[tourl Error]", v40?.["message"] || v40);
      await v24.sendMessage(v27.from, {
        'react': {
          'text': '❌',
          'key': v25.key
        }
      });
      await v24.sendMessage(v27.from, {
        'text': "❌ Error: " + v40.message
      }, {
        'quoted': v25
      });
    }
  }
};
