const fs = require('fs');
const path = require("path");
const crypto = require("crypto");
const {
  exec
} = require("child_process");
const {
  downloadMediaMessage
} = require("@whiskeysockets/baileys");
const webp = require('node-webpmux');
const config = require('../../config');
const {
  getTempDir,
  deleteTempFile
} = require("../../utils/tempManager");
const resolveMedia = v1 => {
  const v2 = Object.keys(v1.message || {})[0];
  if (v2 === "imageMessage" || v2 === "stickerMessage" || v2 === 'videoMessage' || v2 === "documentMessage") {
    return {
      'type': v2,
      'media': v1.message[v2]
    };
  }
  const v3 = v1.message?.["extendedTextMessage"]?.["contextInfo"]?.['quotedMessage'] || v1.message?.["buttonsResponseMessage"]?.["contextInfo"]?.['quotedMessage'] || v1.message?.["listResponseMessage"]?.['contextInfo']?.["quotedMessage"] || null;
  if (!v3) {
    return null;
  }
  const v4 = Object.keys(v3 || {})[0];
  if (v4 === "imageMessage" || v4 === "stickerMessage" || v4 === 'videoMessage' || v4 === "documentMessage") {
    return {
      'type': v4,
      'media': v3[v4]
    };
  }
  return null;
};
module.exports = {
  'name': "circlesticker",
  'aliases': ['cs', 'circsticker', "rsticker"],
  'description': "Convert image/video/gif to a circular sticker (animated for videos)",
  'usage': ".circlesticker (reply to image/video/gif) [packname|author]",
  'category': "general",
  async 'execute'(v5, v6, v7, v8) {
    const v9 = getTempDir();
    const v10 = path.join(v9, "temp_" + Date.now());
    const v11 = path.join(v9, "circlesticker_" + Date.now() + '.webp');
    const v12 = [v10, v11];
    try {
      let v13 = v6;
      if (v6.message?.["extendedTextMessage"]?.["contextInfo"]?.["quotedMessage"]) {
        const v14 = v6.message.extendedTextMessage.contextInfo;
        v13 = {
          'key': {
            'remoteJid': v8.from,
            'id': v14.stanzaId,
            'participant': v14.participant
          },
          'message': v14.quotedMessage
        };
      }
      const v15 = resolveMedia(v13);
      if (!v15) {
        return v8.reply("🔵 Reply to an *image*, *video*, or *gif* that you want to turn into a circle sticker.");
      }
      const {
        type: v16,
        media: v17
      } = v15;
      if (!v17) {
        return v8.reply("🔵 Please reply to an image/video/gif with .circlesticker, or send one with .circlesticker as the caption.");
      }
      const v18 = await downloadMediaMessage(v13, "buffer", {}, {
        'logger': undefined,
        'reuploadRequest': v5.updateMediaMessage
      });
      if (!v18) {
        return v8.reply("❌ Failed to download media. Please try again.");
      }
      if (v18.length > 52428800) {
        return v8.reply("❌ File too large: " + (v18.length / 1024 / 1024).toFixed(2) + "MB (max: " + 50 + "MB)");
      }
      fs.writeFileSync(v10, v18);
      const v19 = v17.mimetype?.['includes']("gif") || v17.mimetype?.["includes"]("video") || v17.seconds > 0 || v16 === "videoMessage";
      const v20 = v18.length / 1024;
      const v21 = v20 > 5000;
      let v22;
      if (v19) {
        if (v21) {
          v22 = "ffmpeg -i \"" + v10 + "\" -t 2 -vf \"" + "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,format=rgba,geq=r='r(X\\,Y)':g='g(X\\,Y)':b='b(X\\,Y)':a='if(lte(pow(X-256\\,2)+pow(Y-256\\,2)\\,pow(256\\,2))\\,alpha(X\\,Y)\\,0)'" + ",fps=8\" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 \"" + v11 + "\"";
        } else {
          v22 = "ffmpeg -i \"" + v10 + "\" -t 3 -vf \"" + "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,format=rgba,geq=r='r(X\\,Y)':g='g(X\\,Y)':b='b(X\\,Y)':a='if(lte(pow(X-256\\,2)+pow(Y-256\\,2)\\,pow(256\\,2))\\,alpha(X\\,Y)\\,0)'" + ",fps=12\" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 50 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 \"" + v11 + "\"";
        }
      } else {
        v22 = "ffmpeg -i \"" + v10 + "\" -vf \"" + "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,format=rgba,geq=r='r(X\\,Y)':g='g(X\\,Y)':b='b(X\\,Y)':a='if(lte(pow(X-256\\,2)+pow(Y-256\\,2)\\,pow(256\\,2))\\,alpha(X\\,Y)\\,0)'" + "\" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 \"" + v11 + "\"";
      }
      await new Promise((v23, v24) => {
        exec(v22, (v25, v26, v27) => {
          if (v25) {
            console.error("FFmpeg error:", v25);
            console.error("FFmpeg stderr:", v27);
            v24(v25);
          } else {
            console.log("FFmpeg stdout:", v26);
            v23();
          }
        });
      });
      if (!fs.existsSync(v11)) {
        throw new Error("FFmpeg failed to create output file");
      }
      const v28 = fs.statSync(v11);
      if (v28.size === 0) {
        throw new Error("FFmpeg created empty output file");
      }
      let v29 = fs.readFileSync(v11);
      const v30 = v29.length / 1024;
      console.log("Final sticker size: " + Math.round(v30) + " KB");
      if (v30 > 1000) {
        console.log("⚠️ Warning: Sticker size (" + Math.round(v30) + " KB) exceeds recommended limit but will be sent anyway");
      }
      const v31 = new webp.Image();
      await v31.load(v29);
      const v32 = v7.join(" ").trim();
      const [v33, v34] = v32 ? v32.split('|').map(v35 => v35.trim()) : [];
      const v36 = {
        'sticker-pack-id': crypto.randomBytes(32).toString("hex"),
        'sticker-pack-name': v33 || config.packname || "✮⃝ˢᵘᵖʳᵉᵐᵉ ᴸᵒʳᵈ",
        'sticker-pack-publisher': v34 || config.author || '',
        'emojis': ['⭕']
      };
      const v37 = Buffer.from([73, 73, 42, 0, 8, 0, 0, 0, 1, 0, 65, 87, 7, 0, 0, 0, 0, 0, 22, 0, 0, 0]);
      const v38 = Buffer.from(JSON.stringify(v36), "utf8");
      const v39 = Buffer.concat([v37, v38]);
      v39.writeUIntLE(v38.length, 14, 4);
      v31.exif = v39;
      const v40 = await v31.save(null);
      await v5.sendMessage(v8.from, {
        'sticker': v40
      }, {
        'quoted': v6
      });
    } catch (v41) {
      console.error("Circle sticker command error:", v41);
      await v8.reply("❌ Failed to create circle sticker! Try with an image, video, or gif.");
    } finally {
      v12.forEach(v42 => deleteTempFile(v42));
    }
  }
};
