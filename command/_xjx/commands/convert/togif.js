const fs = require('fs');
const path = require("path");
const {
  execFile
} = require("child_process");
const {
  downloadMediaMessage
} = require('@whiskeysockets/baileys');
const ffmpegPath = require("../../utils/ffmpegPath");
const {
  getTempDir
} = require('../../utils/tempManager');
function unwrapMessage(v1) {
  let v2 = v1 || {};
  if (v2.ephemeralMessage?.['message']) {
    v2 = v2.ephemeralMessage.message;
  }
  if (v2.viewOnceMessageV2Extension?.["message"]) {
    v2 = v2.viewOnceMessageV2Extension.message;
  }
  if (v2.viewOnceMessageV2?.["message"]) {
    v2 = v2.viewOnceMessageV2.message;
  }
  if (v2.viewOnceMessage?.["message"]) {
    v2 = v2.viewOnceMessage.message;
  }
  if (v2.documentWithCaptionMessage?.["message"]) {
    v2 = v2.documentWithCaptionMessage.message;
  }
  return v2;
}
function findSource(v3) {
  const v4 = unwrapMessage(v3.message);
  if (v4.videoMessage) {
    return {
      'kind': "video",
      'target': v3,
      'video': v4.videoMessage
    };
  }
  if (v4.documentMessage?.["mimetype"]?.['startsWith']("video/")) {
    return {
      'kind': "video",
      'target': v3,
      'video': v4.documentMessage
    };
  }
  const v5 = v3.message?.["extendedTextMessage"]?.['contextInfo'] || v3.message?.["imageMessage"]?.['contextInfo'] || v3.message?.['videoMessage']?.["contextInfo"] || null;
  const v6 = unwrapMessage(v5?.["quotedMessage"]);
  if (!v6 || !v5) {
    return null;
  }
  const v7 = {
    'key': {
      'remoteJid': v5.remoteJid || v3.key.remoteJid,
      'fromMe': false,
      'id': v5.stanzaId,
      'participant': v5.participant
    },
    'message': v6
  };
  if (v6.videoMessage) {
    return {
      'kind': "video",
      'target': v7,
      'video': v6.videoMessage
    };
  }
  if (v6.documentMessage?.["mimetype"]?.["startsWith"]("video/")) {
    return {
      'kind': "video",
      'target': v7,
      'video': v6.documentMessage
    };
  }
  if (v6.stickerMessage?.["isAnimated"]) {
    return {
      'kind': "sticker",
      'target': v7,
      'sticker': v6.stickerMessage
    };
  }
  return null;
}
function probeDuration(v8) {
  return new Promise(v9 => {
    execFile(ffmpegPath, ['-i', v8], (v10, v11, v12) => {
      const v13 = (v12 || '').match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (!v13) {
        return v9(0);
      }
      v9(+v13[1] * 3600 + +v13[2] * 60 + parseFloat(v13[3]));
    });
  });
}
function runFfmpeg(v14) {
  return new Promise((v15, v16) => {
    execFile(ffmpegPath, v14, (v17, v18, v19) => {
      if (v17) {
        const v20 = (v19 || '').split("\n").slice(-4).join(" ").trim();
        return v16(new Error(v20 || v17.message));
      }
      v15();
    });
  });
}
module.exports = {
  'name': "togif",
  'aliases': ["asgif", 'sendgif', "videogif"],
  'category': 'convert',
  'description': "Send a video as a WhatsApp GIF",
  'usage': ".togif (reply to a video, gif, or animated sticker)",
  async 'execute'(v21, v22, v23, v24) {
    const v25 = v24.from;
    const v26 = Date.now();
    const v27 = path.join(getTempDir(), 'gif_in_' + v26 + ".tmp");
    const v28 = path.join(getTempDir(), "gif_out_" + v26 + '.mp4');
    try {
      const v29 = findSource(v22);
      if (!v29) {
        return v24.reply("🎞️ Reply to a *video*, *gif*, or *animated sticker* with `.togif`.\nYou can also send a video with `.togif` as the caption.");
      }
      if (v24.react) {
        await v24.react('🎞️')["catch"](() => {});
      }
      const v30 = await downloadMediaMessage(v29.target, 'buffer', {}, {
        'logger': undefined,
        'reuploadRequest': v21.updateMediaMessage
      });
      if (!v30 || !v30.length) {
        throw new Error("Failed to download the media.");
      }
      if (v29.kind === "sticker") {
        const {
          webp2mp4: v31
        } = require("../../utils/webp2mp4");
        const v32 = await v31(v30);
        if (!v32?.["length"]) {
          throw new Error("Sticker conversion returned empty output.");
        }
        if (v32.length > 16777216) {
          throw new Error("Converted GIF is larger than 16MB.");
        }
        await v21.sendMessage(v25, {
          'video': v32,
          'gifPlayback': true,
          'mimetype': "video/mp4"
        }, {
          'quoted': v22
        });
        if (v24.react) {
          await v24.react('✅')["catch"](() => {});
        }
        return;
      }
      fs.writeFileSync(v27, v30);
      const v33 = await probeDuration(v27);
      const v34 = v33 > 45 ? ['-t', String(45)] : [];
      await runFfmpeg(['-y', '-i', v27, ...v34, "-an", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-preset", "veryfast", "-crf", '28', "-pix_fmt", "yuv420p", "-movflags", "+faststart", '-f', "mp4", v28]);
      if (!fs.existsSync(v28) || fs.statSync(v28).size === 0) {
        throw new Error("Conversion produced an empty file.");
      }
      const v35 = fs.readFileSync(v28);
      if (v35.length > 16777216) {
        throw new Error("Converted GIF is larger than 16MB.");
      }
      await v21.sendMessage(v25, {
        'video': v35,
        'gifPlayback': true,
        'mimetype': "video/mp4"
      }, {
        'quoted': v22
      });
      if (v24.react) {
        await v24.react('✅')["catch"](() => {});
      }
    } catch (v36) {
      console.error("[togif]", v36.message);
      if (v24.react) {
        await v24.react('❌')["catch"](() => {});
      }
      try {
        const v37 = findSource(v22);
        if (v37?.["kind"] === 'video') {
          const v38 = await downloadMediaMessage(v37.target, 'buffer', {}, {
            'logger': undefined,
            'reuploadRequest': v21.updateMediaMessage
          });
          if (v38?.["length"] && v38.length <= 16777216) {
            await v21.sendMessage(v25, {
              'video': v38,
              'gifPlayback': true,
              'mimetype': "video/mp4"
            }, {
              'quoted': v22
            });
            return;
          }
        }
      } catch (v39) {}
      await v24.reply("❌ ToGIF failed: " + v36.message);
    } finally {
      for (const v40 of [v27, v28]) {
        try {
          if (fs.existsSync(v40)) {
            fs.unlinkSync(v40);
          }
        } catch (v41) {}
      }
    }
  }
};
