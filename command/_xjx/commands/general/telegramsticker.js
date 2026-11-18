const fetch = require("node-fetch");
const fs = require('fs');
const path = require("path");
const crypto = require("crypto");
const {
  spawn
} = require("child_process");
const webp = require("node-webpmux");
const ffmpegPath = require("../../utils/ffmpegPath");
const config = require("../../config");
const {
  getTempDir,
  deleteTempFile
} = require("../../utils/tempManager");
const delay = v1 => new Promise(v2 => setTimeout(v2, v1));
async function fetchBuffer(v3) {
  const v4 = await fetch(v3, {
    'headers': {
      'User-Agent': "JuneXUltra/2.0"
    }
  });
  if (!v4.ok) {
    throw new Error("HTTP " + v4.status + " for " + v3);
  }
  return v4.buffer();
}
async function toWebp(v5, v6, v7) {
  const v8 = v7 ? ['-y', '-i', v5, "-vf", 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000', "-c:v", "libwebp", '-lossless', '0', "-q:v", '60', '-loop', '0', '-vsync', '0', '-pix_fmt', "yuva420p", "-an", '-t', '6', v6] : ['-y', '-i', v5, "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000", "-c:v", "libwebp", '-lossless', '0', "-q:v", '75', v6];
  await new Promise((v9, v10) => {
    const v11 = spawn(ffmpegPath, v8);
    const v12 = [];
    v11.stderr.on("data", v13 => v12.push(v13));
    v11.on("error", v10);
    v11.on("close", v14 => v14 === 0 ? v9() : v10(new Error(Buffer.concat(v12).toString().slice(-200))));
  });
}
async function embedExif(v15, v16, v17, v18) {
  const v19 = new webp.Image();
  await v19.load(v15);
  const v20 = {
    'sticker-pack-id': v16,
    'sticker-pack-name': v17,
    'emojis': v18 ? [v18] : ['🤖']
  };
  const v21 = Buffer.from([73, 73, 42, 0, 8, 0, 0, 0, 1, 0, 65, 87, 7, 0, 0, 0, 0, 0, 22, 0, 0, 0]);
  const v22 = Buffer.from(JSON.stringify(v20), "utf8");
  const v23 = Buffer.concat([v21, v22]);
  v23.writeUIntLE(v22.length, 14, 4);
  v19.exif = v23;
  return v19.save(null);
}
module.exports = {
  'name': "telegramsticker",
  'aliases': ["tgs", "tgms", "tgsticker"],
  'category': 'general',
  'description': "Download a Telegram sticker pack and send as WhatsApp sticker pack(s) of 59",
  'usage': ".tgs https://t.me/addstickers/<PackName>",
  async 'execute'(v24, v25, v26, v27) {
    const {
      from: v28,
      reply: v29
    } = v27;
    const v30 = v26[0] || '';
    if (!v30) {
      return v29("📦 *Telegram Sticker Pack*\n━━━━━━━━━━━━━━━\nSend an entire Telegram sticker pack as WhatsApp sticker packs (59 per pack).\n\n*Usage:*\n  .tgs https://t.me/addstickers/PackName\n\n*Example:*\n  .tgs https://t.me/addstickers/Porcientoreal");
    }
    if (!v30.match(/https?:\/\/t\.me\/addstickers\//i)) {
      return v29("❌ Invalid URL.\nUse a Telegram sticker pack link:\n_https://t.me/addstickers/PackName_");
    }
    const v31 = v30.replace(/https?:\/\/t\.me\/addstickers\//i, '').split('/')[0].trim();
    let v32;
    try {
      const v33 = await fetch("https://api.telegram.org/bot8773913673:AAGRx9OBJHP1u1mEOKa741Cmmz6woXgXSNY/getStickerSet?name=" + encodeURIComponent(v31));
      const v34 = await v33.json();
      if (!v34.ok) {
        throw new Error(v34.description || "Unknown error");
      }
      v32 = v34.result;
    } catch (v35) {
      return v29("❌ Could not fetch sticker pack.\n" + v35.message + "\n\nMake sure the pack link is correct.");
    }
    const v36 = v32.stickers;
    const v37 = v36.length;
    const v38 = v32.title || v31;
    if (v32.is_animated === true) {
      return v29("❌ *" + v38 + "* is a Lottie-animated pack (.tgs / vector JSON).\n" + "These can't be converted to WhatsApp stickers without extra dependencies.\n\n" + "Try a *static* or *video* pack instead.");
    }
    const v39 = [];
    for (let v40 = 0; v40 < v36.length; v40 += 59) {
      v39.push(v36.slice(v40, v40 + 59));
    }
    const v41 = v39.length;
    const v42 = v39.map(() => crypto.randomBytes(32).toString('hex'));
    const v43 = v25.pushName || 'User';
    const v44 = await v24.sendMessage(v28, {
      'text': "📦 *" + v38 + "*\n" + ("🎯 *" + v37 + "* stickers → *" + v41 + "* pack" + (v41 > 1 ? 's' : '') + " of up to " + 59 + "\n") + "⏳ _Starting download…_"
    }, {
      'quoted': v25
    });
    const v45 = v44?.["key"];
    const v46 = async v47 => {
      if (!v45) {
        return;
      }
      try {
        await v24.sendMessage(v28, {
          'edit': v45,
          'text': v47
        });
      } catch (v48) {}
    };
    const v49 = getTempDir();
    let v50 = 0;
    let v51 = 0;
    let v52 = 0;
    for (let v53 = 0; v53 < v39.length; v53++) {
      const v54 = v39[v53];
      const v55 = v42[v53];
      const v56 = v53 + 1;
      const v57 = v41 > 1 ? v43 + " (" + v56 + '/' + v41 + ')' : v43;
      for (let v58 = 0; v58 < v54.length; v58++) {
        const v59 = v53 * 59 + v58;
        const v60 = v54[v58];
        const v61 = path.join(v49, "tg_in_" + Date.now() + '_' + v59);
        const v62 = path.join(v49, "tg_out_" + Date.now() + '_' + v59 + ".webp");
        if (v59 === 0 || v59 % 5 === 0) {
          await v46("📦 *" + v38 + "*\n" + ("🗂 Pack *" + v56 + '/' + v41 + "* — sticker *" + (v59 + 1) + '/' + v37 + "*\n") + ("✅ Sent: " + v50 + "  ⏭ Skipped: " + v52 + "  ❌ Failed: " + v51));
        }
        try {
          if (v60.is_animated && !v60.is_video) {
            v52++;
            continue;
          }
          const v63 = await fetch("https://api.telegram.org/bot8773913673:AAGRx9OBJHP1u1mEOKa741Cmmz6woXgXSNY/getFile?file_id=" + v60.file_id);
          const v64 = await v63.json();
          if (!v64.ok) {
            throw new Error("getFile failed");
          }
          const v65 = v64.result.file_path || '';
          const v66 = "https://api.telegram.org/file/bot8773913673:AAGRx9OBJHP1u1mEOKa741Cmmz6woXgXSNY/" + v65;
          const v67 = await fetchBuffer(v66);
          fs.writeFileSync(v61, v67);
          const v68 = !!v60.is_video || v65.endsWith('.webm');
          const v69 = v65.endsWith(".webp") && !v68;
          let v70;
          if (v69) {
            v70 = v67;
          } else {
            await toWebp(v61, v62, v68);
            v70 = fs.readFileSync(v62);
          }
          const v71 = await embedExif(v70, v55, v57, v60.emoji);
          await v24.sendMessage(v28, {
            'sticker': v71
          });
          v50++;
          await delay(400);
        } catch (v72) {
          console.error("[TGS] Sticker " + (v59 + 1) + " failed:", v72.message);
          v51++;
        } finally {
          try {
            deleteTempFile(v61);
          } catch (v73) {}
          try {
            deleteTempFile(v62);
          } catch (v74) {}
        }
      }
      if (v53 < v39.length - 1) {
        await delay(1000);
      }
    }
    await v46("✅ *" + v38 + "* — Done!\n" + ("📊 Sent: *" + v50 + '/' + v37 + "* across *" + v41 + "* pack" + (v41 > 1 ? 's' : '') + "\n") + (v52 ? "⏭ Skipped (Lottie): " + v52 + "\n" : '') + (v51 ? "❌ Failed: " + v51 + "\n" : '') + ("\n> Powered by " + (config.botName || "JuneX-Ultra")));
  }
};
