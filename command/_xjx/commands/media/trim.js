const fs = require('fs');
const path = require("path");
const {
  execFile
} = require('child_process');
const {
  downloadMediaMessage
} = require("@whiskeysockets/baileys");
const {
  getTempDir,
  deleteTempFile
} = require("../../utils/tempManager");
const ffmpegPath = require("../../utils/ffmpegPath");
module.exports = {
  'name': "trim",
  'aliases': ["trimvid", 'trimaudio', 'cut'],
  'category': "media",
  'description': "Trim an audio or video file to a specific time range",
  'usage': ".trim <start> <end> (reply to an audio or video)",
  async 'execute'(v1, v2, v3) {
    const v4 = v2.key.remoteJid;
    const v5 = path.join(getTempDir(), "input_" + Date.now());
    const v6 = path.join(getTempDir(), 'trim_' + Date.now());
    try {
      await v1.sendMessage(v4, {
        'react': {
          'text': '✂️',
          'key': v2.key
        }
      });
      if (!v3 || v3.length < 2) {
        return v1.sendMessage(v4, {
          'text': "❌ Reply to an audio or video file with start and end time.\n\nExample: `.trim 0:10 0:30`"
        }, {
          'quoted': v2
        });
      }
      const [v7, v8] = v3;
      const v9 = /^(\d{1,2}:)?[0-5]?\d:[0-5]?\d$/;
      if (!v9.test(v7) || !v9.test(v8)) {
        return v1.sendMessage(v4, {
          'text': "⚠️ Invalid time format. Use MM:SS or HH:MM:SS\nExample: `.trim 0:30 1:45`"
        }, {
          'quoted': v2
        });
      }
      const v10 = v2.message?.["extendedTextMessage"]?.["contextInfo"];
      if (!v10?.["quotedMessage"]) {
        return v1.sendMessage(v4, {
          'text': "❌ Please reply to an audio or video file with this command."
        }, {
          'quoted': v2
        });
      }
      const v11 = v10.quotedMessage;
      const v12 = v11.audioMessage;
      const v13 = v11.videoMessage;
      if (!v12 && !v13) {
        return v1.sendMessage(v4, {
          'text': "❌ Unsupported media type. Please reply to an audio or video file."
        }, {
          'quoted': v2
        });
      }
      const v14 = {
        'key': {
          'remoteJid': v10.remoteJid || v4,
          'fromMe': false,
          'id': v10.stanzaId,
          'participant': v10.participant
        },
        'message': v11
      };
      const v15 = await downloadMediaMessage(v14, "buffer", {}, {
        'logger': undefined,
        'reuploadRequest': v1.updateMediaMessage
      });
      if (!v15 || v15.length === 0) {
        return v1.sendMessage(v4, {
          'text': "❌ Failed to download the media. Please try again."
        }, {
          'quoted': v2
        });
      }
      const v16 = !!v12;
      const v17 = v5 + (v16 ? ".tmp" : ".tmp");
      const v18 = v6 + (v16 ? ".mp3" : '.mp4');
      fs.writeFileSync(v17, v15);
      const v19 = v16 ? ['-y', '-i', v17, "-ss", v7, "-to", v8, "-vn", "-c:a", "libmp3lame", '-q:a', '2', v18] : ['-y', '-i', v17, "-ss", v7, "-to", v8, "-c:v", "copy", '-c:a', "aac", "-b:a", "128k", "-movflags", "+faststart", v18];
      await new Promise((v20, v21) => {
        execFile(ffmpegPath, v19, (v22, v23, v24) => {
          deleteTempFile(v17);
          if (v22) {
            console.error("[Trim] FFmpeg stderr:", v24);
            return v21(new Error("FFmpeg failed: " + (v24?.["split"]("\n")["slice"](-4)['join'](" ")["trim"]() || v22.message)));
          }
          v20();
        });
      });
      if (!fs.existsSync(v18) || fs.statSync(v18).size === 0) {
        throw new Error("Trim produced an empty file — check the time range.");
      }
      await v1.sendMessage(v4, {
        'text': "_✂️ Trimmed clip ready!_"
      }, {
        'quoted': v2
      });
      const v25 = fs.readFileSync(v18);
      const v26 = v16 ? {
        'audio': v25,
        'mimetype': 'audio/mpeg',
        'fileName': 'trimmed.mp3'
      } : {
        'video': v25,
        'mimetype': "video/mp4",
        'fileName': 'trimmed.mp4'
      };
      await v1.sendMessage(v4, v26, {
        'quoted': v2
      });
    } catch (v27) {
      console.error("[Trim] Error:", v27);
      return v1.sendMessage(v4, {
        'text': "🚫 Error: " + v27.message
      }, {
        'quoted': v2
      });
    } finally {
      [v5 + ".tmp", v6 + ".mp3", v6 + ".mp4"].forEach(v28 => {
        try {
          if (fs.existsSync(v28)) {
            fs.unlinkSync(v28);
          }
        } catch (v29) {}
      });
    }
  }
};
