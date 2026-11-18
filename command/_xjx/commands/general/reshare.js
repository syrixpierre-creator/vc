const {
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const config = require("../../config");
function isStatusReply(v1) {
  const v2 = v1.message?.["extendedTextMessage"]?.['contextInfo'];
  return v2 && v2.remoteJid === "status@broadcast";
}
function getStatusJidList(v3) {
  const v4 = new Set();
  const v5 = [].concat(config.ownerNumber || []);
  for (const v6 of v5) {
    const v7 = String(v6).replace(/\D/g, '');
    if (v7) {
      v4.add(v7 + '@s.whatsapp.net');
    }
  }
  try {
    const v8 = v3.botStore?.["messages"];
    if (v8 instanceof Map) {
      for (const v9 of v8.keys()) {
        if (v9 && v9.endsWith("@s.whatsapp.net")) {
          v4.add(v9);
        }
      }
    }
  } catch (v10) {}
  return [...v4];
}
async function downloadStatusMedia(v11) {
  const v12 = {
    'imageMessage': {
      'type': "image",
      'ext': ".jpg"
    },
    'videoMessage': {
      'type': "video",
      'ext': ".mp4"
    },
    'audioMessage': {
      'type': "audio",
      'ext': ".mp3"
    },
    'stickerMessage': {
      'type': "sticker",
      'ext': '.webp'
    },
    'documentMessage': {
      'type': "document",
      'ext': ".bin"
    }
  };
  for (const [v13, {
    type: v14,
    ext: v15
  }] of Object.entries(v12)) {
    if (!v11[v13]) {
      continue;
    }
    try {
      const v16 = await downloadContentFromMessage(v11[v13], v14);
      const v17 = [];
      for await (const v18 of v16) v17.push(v18);
      return {
        'buffer': Buffer.concat(v17),
        'type': v14,
        'ext': v15,
        'mime': v11[v13].mimetype || '',
        'caption': v11[v13].caption || ''
      };
    } catch (v19) {}
  }
  const v20 = v11.conversation || v11.extendedTextMessage?.['text'] || v11.ephemeralMessage?.['message']?.["conversation"] || '';
  if (v20) {
    return {
      'type': "text",
      'text': v20
    };
  }
  return null;
}
module.exports = {
  'name': 'reshare',
  'aliases': ['rs', "repost", "status"],
  'category': "general",
  'description': "Re-share a WhatsApp status you replied to as your own status",
  'usage': ".reshare [custom text] — reply to a status to re-share it",
  async 'execute'(v21, v22, v23, v24) {
    try {
      const v25 = v24.from || v22.key.remoteJid;
      const v26 = v22.message?.["extendedTextMessage"]?.["contextInfo"];
      const v27 = v26?.["quotedMessage"];
      if (!v27) {
        return v24.reply("❌ *Usage:* .reshare [custom text]\n\n*Reply* to a status message to re-share it as your own status.\n\nExamples:\n• .reshare (reply to a status)\n• .reshare hello (reply to a status with custom caption)\n\n_Supports: images, videos, audio, text statuses_");
      }
      if (!isStatusReply(v22)) {
        return v24.reply("❌ The replied message is not a *status* update.\n\nPlease reply to a WhatsApp status to re-share it.");
      }
      await v21.sendMessage(v25, {
        'react': {
          'text': '🔄',
          'key': v22.key
        }
      })['catch'](() => {});
      const v28 = await downloadStatusMedia(v27);
      if (!v28) {
        return v24.reply("❌ Could not download the status. It may have expired.");
      }
      const v29 = v23.join(" ").trim() || undefined;
      const v30 = getStatusJidList(v21);
      if (v28.type === 'text') {
        const v31 = v29 || v28.text || '';
        if (!v31) {
          return v24.reply("❌ No text found to re-share.");
        }
        await v21.sendMessage("status@broadcast", {
          'text': v31,
          'backgroundColor': "#000000",
          'font': 0x2
        }, {
          'statusJidList': v30
        });
        return v24.reply("✅ Text status re-shared successfully.");
      } else {
        if (v28.type === "image") {
          const v32 = v29 || v28.caption || '';
          await v21.sendMessage("status@broadcast", {
            'image': v28.buffer,
            'mimetype': v28.mime || "image/jpeg",
            'caption': v32 || undefined
          }, {
            'statusJidList': v30
          });
          return v24.reply("✅ Image status re-shared successfully.");
        } else {
          if (v28.type === 'video') {
            const v33 = v29 || v28.caption || '';
            await v21.sendMessage("status@broadcast", {
              'video': v28.buffer,
              'mimetype': v28.mime || "video/mp4",
              'caption': v33 || undefined,
              'gifPlayback': false
            }, {
              'statusJidList': v30
            });
            return v24.reply("✅ Video status re-shared successfully.");
          } else {
            if (v28.type === "audio") {
              await v21.sendMessage("status@broadcast", {
                'audio': v28.buffer,
                'mimetype': v28.mime || "audio/mp4",
                'ptt': false
              }, {
                'statusJidList': v30
              });
              return v24.reply("✅ Audio status re-shared successfully.");
            } else {
              return v28.type === "sticker" ? (await v21.sendMessage("status@broadcast", {
                'sticker': v28.buffer
              }, {
                'statusJidList': v30
              }), v24.reply("✅ Sticker status re-shared successfully.")) : (await v21.sendMessage("status@broadcast", {
                'document': v28.buffer,
                'mimetype': v28.mime || "application/octet-stream",
                'fileName': "reshared_status",
                'caption': v29 || ''
              }, {
                'statusJidList': v30
              }), v24.reply("✅ Status re-shared successfully."));
            }
          }
        }
      }
    } catch (v34) {
      try {
        await v24.reply("❌ Re-share failed: " + (v34.message || "Unknown error"));
      } catch (v35) {}
    }
  }
};
