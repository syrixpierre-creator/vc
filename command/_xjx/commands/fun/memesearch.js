const axios = require("axios");
const fs = require('fs');
const path = require("path");
const {
  exec
} = require("child_process");
const ffmpegPath = require('../../utils/ffmpegPath');
const {
  getTempDir,
  deleteTempFile
} = require("../../utils/tempManager");
module.exports = {
  'name': "memesearch",
  'aliases': ['memes', 'sm', "smeme", "gifsearch", 'gif'],
  'category': "fun",
  'desc': "Search and get memes",
  'usage': "memesearch <query>",
  'execute': async (v1, v2, v3, v4) => {
    try {
      const v5 = v3.join(" ").trim();
      if (!v5) {
        return await v4.reply("Usage: .memesearch <query>\n\nExample: .memesearch hello");
      }
      const v6 = "https://api.shizo.top/tools/meme-search?apikey=shizo&query=" + encodeURIComponent(v5);
      const v7 = await axios.get(v6, {
        'responseType': 'arraybuffer',
        'headers': {
          'User-Agent': "Mozilla/5.0"
        }
      });
      const v8 = Buffer.from(v7.data);
      if (!v8 || v8.length === 0) {
        throw new Error("Empty response from API");
      }
      const v9 = v7.headers["content-type"] || '';
      const v10 = v8.slice(0, 6).toString("ascii");
      const v11 = v10 === "GIF89a" || v10 === "GIF87a" || v9.includes('gif');
      if (v11) {
        if (v8.length > 16777216) {
          throw new Error("GIF file too large: " + (v8.length / 1024 / 1024).toFixed(2) + "MB (max 16MB)");
        }
        const v12 = getTempDir();
        const v13 = Date.now();
        const v14 = path.join(v12, "meme_gif_" + v13 + ".gif");
        const v15 = path.join(v12, 'meme_mp4_' + v13 + ".mp4");
        let v16 = null;
        try {
          fs.writeFileSync(v14, v8);
          const v17 = "\"" + ffmpegPath + "\" -i \"" + v14 + "\" -vf \"fps=15,scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000\" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -fps_mode vfr -y \"" + v15 + "\"";
          await new Promise((v18, v19) => {
            exec(v17, {
              'maxBuffer': 10485760
            }, v20 => {
              if (v20) {
                v19(v20);
              } else {
                v18();
              }
            });
          });
          if (!fs.existsSync(v15)) {
            throw new Error("MP4 output file not found");
          }
          v16 = fs.readFileSync(v15);
          if (v16.length > 16777216) {
            throw new Error("MP4 file too large: " + (v16.length / 1024 / 1024).toFixed(2) + 'MB');
          }
          const v21 = await v1.sendMessage(v4.from, {
            'video': v16,
            'mimetype': 'video/mp4',
            'gifPlayback': true
          }, {
            'quoted': v2
          });
          if (!v21) {
            throw new Error("Video send returned no result");
          }
        } catch (v22) {
          try {
            const v23 = await v1.sendMessage(v4.from, {
              'document': v8,
              'mimetype': "image/gif",
              'fileName': "meme_" + v5.replace(/\s+/g, '_') + ".gif"
            }, {
              'quoted': v2
            });
            if (!v23) {
              throw new Error("Document send returned no result");
            }
          } catch (v24) {
            throw new Error("Failed to send meme: " + v22.message);
          }
        } finally {
          try {
            deleteTempFile(v14);
            deleteTempFile(v15);
          } catch (v25) {}
        }
      } else {
        if (v9.includes("video") || v9.includes("mp4")) {
          if (v8.length > 16777216) {
            throw new Error("Video file too large: " + (v8.length / 1024 / 1024).toFixed(2) + "MB (max 16MB)");
          }
          await v1.sendMessage(v4.from, {
            'video': v8,
            'mimetype': "video/mp4"
          }, {
            'quoted': v2
          });
        } else {
          if (v8.length > 5242880) {
            throw new Error("Image file too large: " + (v8.length / 1024 / 1024).toFixed(2) + "MB (max 5MB)");
          }
          await v1.sendMessage(v4.from, {
            'image': v8
          }, {
            'quoted': v2
          });
        }
      }
    } catch (v26) {
      await v4.reply("❌ Failed to fetch meme: " + v26.message);
    }
  }
};
