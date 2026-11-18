const fs = require('fs');
const path = require("path");
const {
  exec,
  execSync
} = require('child_process');
const crypto = require('crypto');
const sharp = require('sharp');
const webp = require('node-webpmux');
const {
  downloadMediaMessage
} = require('@whiskeysockets/baileys');
const {
  getTempDir,
  deleteTempFile
} = require("../../utils/tempManager");
const config = require("../../config");
let _ffmpegPath = null;
function resolveFFmpeg() {
  if (_ffmpegPath) {
    return _ffmpegPath;
  }
  const v1 = [];
  try {
    const v2 = execSync("which ffmpeg 2>/dev/null", {
      'encoding': "utf8"
    }).trim();
    if (v2) {
      v1.push(v2);
    }
  } catch (v3) {}
  v1.push("/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg");
  try {
    const v4 = execSync("find /nix/store -maxdepth 3 -name ffmpeg -type f 2>/dev/null | head -5", {
      'encoding': "utf8",
      'timeout': 0xfa0
    }).split("\n").filter(Boolean);
    v1.push(...v4);
  } catch (v5) {}
  try {
    v1.push(require("ffmpeg-static"));
  } catch (v6) {}
  for (const v7 of v1) {
    try {
      if (!v7 || !fs.existsSync(v7)) {
        continue;
      }
      const v8 = execSync("\"" + v7 + "\" -filters 2>&1", {
        'encoding': "utf8",
        'timeout': 0x1388
      });
      if (v8.includes('drawtext')) {
        _ffmpegPath = v7;
        return v7;
      }
    } catch (v9) {}
  }
  return null;
}
const POSITION_ALIASES = {
  'mid': 'center',
  'middle': "center",
  'up': 'top',
  'down': "bottom",
  'r': "right",
  'l': "left"
};
function svgCoords(v10, v11, v12, v13, v14) {
  const v15 = v13 * 1.2;
  const v16 = v15 * v14;
  const v17 = v11 / 2;
  switch (v10) {
    case 'top':
      return {
        'x': v17,
        'y': 24 + v13,
        'anchor': "middle"
      };
    case 'bottom':
      return {
        'x': v17,
        'y': v12 - 24 - v16 + v13,
        'anchor': "middle"
      };
    case 'left':
      return {
        'x': 24,
        'y': (v12 - v16) / 2 + v13,
        'anchor': "start"
      };
    case "right":
      return {
        'x': v11 - 24,
        'y': (v12 - v16) / 2 + v13,
        'anchor': "end"
      };
    case "topleft":
      return {
        'x': 24,
        'y': 24 + v13,
        'anchor': "start"
      };
    case "topright":
      return {
        'x': v11 - 24,
        'y': 24 + v13,
        'anchor': "end"
      };
    case "bottomleft":
      return {
        'x': 24,
        'y': v12 - 24 - v16 + v13,
        'anchor': "start"
      };
    case "bottomright":
      return {
        'x': v11 - 24,
        'y': v12 - 24 - v16 + v13,
        'anchor': "end"
      };
    default:
      return {
        'x': v17,
        'y': (v12 - v16) / 2 + v13,
        'anchor': "middle"
      };
  }
}
function wrapText(v18, v19 = 20) {
  const v20 = v18.split(" ");
  const v21 = [];
  let v22 = '';
  for (const v23 of v20) {
    if ((v22 + (v22 ? " " : '') + v23).length > v19) {
      if (v22) {
        v21.push(v22);
      }
      v22 = v23;
    } else {
      v22 = v22 ? v22 + " " + v23 : v23;
    }
  }
  if (v22) {
    v21.push(v22);
  }
  return v21;
}
function xmlEsc(v24) {
  return v24.replace(/&/g, "&amp;").replace(/</g, '&lt;').replace(/>/g, "&gt;").replace(/"/g, '&quot;').replace(/'/g, "&apos;");
}
async function overlayTextSharp(v25, v26, v27, v28, v29 = {}) {
  const v30 = await sharp(v25).metadata();
  const v31 = v30.width || 512;
  const v32 = v30.height || 512;
  const v33 = Math.max(28, Math.min(72, Math.floor(v31 / 7)));
  const v34 = Math.max(10, Math.floor(v31 / (v33 * 0.55)));
  const v35 = wrapText(v26, v34);
  const v36 = v33 * 1.2;
  const {
    x: v37,
    y: v38,
    anchor: v39
  } = svgCoords(v27, v31, v32, v33, v35.length);
  const v40 = v35.map((v41, v42) => {
    const v43 = v42 === 0 ? 0 : v36;
    return "<tspan x=\"" + v37 + "\" dy=\"" + v43 + "\">" + v41.replace(/&/g, "&amp;").replace(/</g, '&lt;').replace(/>/g, "&gt;").replace(/"/g, '&quot;').replace(/'/g, "&apos;") + "</tspan>";
  }).join('');
  const v44 = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + v31 + "\" height=\"" + v32 + "\">\n  <text\n    x=\"" + v37 + "\" y=\"" + v38 + "\"\n    text-anchor=\"" + v39 + "\"\n    font-family=\"DejaVu Sans Bold, Arial Bold, sans-serif\"\n    font-size=\"" + v33 + "\"\n    font-weight=\"bold\"\n    fill=\"white\"\n    stroke=\"black\"\n    stroke-width=\"" + Math.max(2, Math.round(v33 / 14)) + "\"\n    paint-order=\"stroke\"\n  >" + v40 + "</text>\n</svg>";
  let v45 = sharp(v25).composite([{
    'input': Buffer.from(v44),
    'top': 0x0,
    'left': 0x0
  }]);
  if (v28 === "webp") {
    v45 = v45.webp({
      'quality': 0x55,
      ...v29
    });
  } else {
    v45 = v45.jpeg({
      'quality': 0x58,
      ...v29
    });
  }
  return v45.toBuffer();
}
function ffmpegDrawtext(v46, v47, v48, v49, v50, v51, v52) {
  const v53 = {
    'center': "x=(w-text_w)/2:y=(h-text_h)/2",
    'top': "x=(w-text_w)/2:y=30",
    'bottom': "x=(w-text_w)/2:y=h-text_h-30",
    'left': 'x=20:y=(h-text_h)/2',
    'right': 'x=w-text_w-20:y=(h-text_h)/2',
    'topleft': "x=20:y=20",
    'topright': 'x=w-text_w-20:y=20',
    'bottomleft': "x=20:y=h-text_h-30",
    'bottomright': "x=w-text_w-20:y=h-text_h-30"
  };
  const v54 = v53[v50] || "x=(w-text_w)/2:y=h-text_h-30";
  const v55 = "fontfile='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf':textfile='" + v52 + "':fontsize=60:fontcolor=white:borderw=4:bordercolor=black:" + v54;
  const v56 = v51 ? "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,drawtext=" + v55 : "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,drawtext=" + v55;
  const v57 = "\"" + v46 + "\" -y -i \"" + v47 + "\" -vf \"" + v56 + "\" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 80 \"" + v48 + "\"";
  return new Promise((v58, v59) => exec(v57, {
    'maxBuffer': 52428800
  }, v60 => v60 ? v59(v60) : v58()));
}
async function addExif(v61) {
  const v62 = new webp.Image();
  await v62.load(v61);
  const v63 = {
    'sticker-pack-id': crypto.randomBytes(32).toString("hex"),
    'sticker-pack-name': config.packname || config.botName,
    'emojis': ['✍️']
  };
  const v64 = Buffer.from([73, 73, 42, 0, 8, 0, 0, 0, 1, 0, 65, 87, 7, 0, 0, 0, 0, 0, 22, 0, 0, 0]);
  const v65 = Buffer.from(JSON.stringify(v63), "utf8");
  const v66 = Buffer.concat([v64, v65]);
  v66.writeUIntLE(v65.length, 14, 4);
  v62.exif = v66;
  return v62.save(null);
}
module.exports = {
  'name': "write",
  'aliases': ["memetext", "addtext", "textwrite", "wrt"],
  'category': "general",
  'description': "Write meme text on stickers or images (static & animated)",
  'usage': ".write <text> [center|top|bottom|left|right] — reply to sticker/image",
  async 'execute'(v67, v68, v69, v70) {
    const v71 = v70.from;
    if (!v69.length) {
      return v70.reply("✍️ *Write text on stickers / images*\n\n*Usage:* .write <text> [position]\n\n*Positions:*\n• center (default)\n• top  •  bottom\n• left  •  right\n• topleft  •  topright\n• bottomleft  •  bottomright\n\n*Examples:*\n_.write Supreme center_\n_.write It's me bottom_\n_.write LOL topleft_\n\nReply to an image or sticker.");
    }
    const v72 = ["center", "top", "bottom", "left", 'right', 'topleft', "topright", "bottomleft", "bottomright"];
    let v73 = "bottom";
    let v74 = [...v69];
    const v75 = v69[v69.length - 1].toLowerCase();
    const v76 = POSITION_ALIASES[v75] || (v72.includes(v75) ? v75 : null);
    if (v76) {
      v73 = v76;
      v74 = v69.slice(0, -1);
    }
    const v77 = v74.join(" ").trim();
    if (!v77) {
      return v70.reply("❌ Please provide the text to write.");
    }
    const v78 = v68.message?.['extendedTextMessage']?.['contextInfo'];
    if (!v78?.['quotedMessage']) {
      return v70.reply("❌ Reply to a sticker or image with this command.");
    }
    const v79 = v78.quotedMessage;
    const v80 = !!v79.stickerMessage;
    const v81 = !!v79.imageMessage;
    const v82 = !!v79.videoMessage;
    const v83 = v80 ? v79.stickerMessage?.["isAnimated"] ?? false : v82;
    if (!v80 && !v81 && !v82) {
      return v70.reply("❌ Reply to a sticker or image.");
    }
    await v67.sendMessage(v71, {
      'react': {
        'text': '⏳',
        'key': v68.key
      }
    });
    const v84 = getTempDir();
    const v85 = Date.now();
    const v86 = path.join(v84, "wrt_in_" + v85);
    const v87 = path.join(v84, "wrt_txt_" + v85 + ".txt");
    const v88 = path.join(v84, "wrt_out_" + v85 + ".webp");
    const v89 = path.join(v84, "wrt_out_" + v85 + ".jpg");
    const v90 = [v86, v87, v88, v89];
    try {
      const v91 = {
        'key': {
          'remoteJid': v71,
          'id': v78.stanzaId,
          'participant': v78.participant
        },
        'message': v79
      };
      const v92 = await downloadMediaMessage(v91, "buffer", {}, {
        'logger': undefined,
        'reuploadRequest': v67.updateMediaMessage
      });
      if (!v92) {
        return v70.reply("❌ Failed to download media.");
      }
      if (v83) {
        const v93 = resolveFFmpeg();
        if (!v93) {
          return v70.reply("❌ Animated stickers require ffmpeg with the *drawtext* filter, which is not available on this server.\n\nTry with a *static* sticker or image instead.");
        }
        fs.writeFileSync(v86, v92);
        fs.writeFileSync(v87, v77, "utf8");
        await ffmpegDrawtext(v93, v86, v88, v77, v73, true, v87);
        let v94 = fs.readFileSync(v88);
        v94 = await addExif(v94);
        await v67.sendMessage(v71, {
          'sticker': v94
        }, {
          'quoted': v68
        });
      } else {
        if (v80) {
          let v95 = await overlayTextSharp(v92, v77, v73, "webp");
          v95 = await addExif(v95);
          await v67.sendMessage(v71, {
            'sticker': v95
          }, {
            'quoted': v68
          });
        } else {
          const v96 = await overlayTextSharp(v92, v77, v73, 'jpeg');
          await v67.sendMessage(v71, {
            'image': v96,
            'caption': "✍️ " + v77
          }, {
            'quoted': v68
          });
        }
      }
      await v67.sendMessage(v71, {
        'react': {
          'text': '✅',
          'key': v68.key
        }
      });
    } catch (v97) {
      console.error("[write] error:", v97.message || v97);
      await v67.sendMessage(v71, {
        'react': {
          'text': '❌',
          'key': v68.key
        }
      });
      await v70.reply("❌ Failed to write text: " + v97.message);
    } finally {
      v90.forEach(v98 => {
        try {
          deleteTempFile(v98);
        } catch (v99) {}
      });
    }
  }
};
