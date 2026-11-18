const axios = require('axios');
const fs = require('fs');
const path = require("path");
const {
  sendButtons
} = require("gifted-btns");
const config = require("../../config");
function extractButtonResponseId(v1) {
  return v1.message?.["buttonsResponseMessage"]?.["selectedButtonId"] || v1.message?.['templateButtonReplyMessage']?.["selectedId"] || v1.message?.["interactiveResponseMessage"]?.["nativeFlowResponseMessage"]?.["paramsJson"] || null;
}
function getResponseSender(v2) {
  return v2.key?.['participant'] || v2.key?.["remoteJid"];
}
async function withRetry(v3, v4 = 3, v5 = 3000) {
  let v6;
  for (let v7 = 0; v7 < v4; v7++) {
    try {
      return await v3();
    } catch (v8) {
      v6 = v8;
      const v9 = v8.message?.["toLowerCase"]()["includes"]("busy") || v8.message?.['toLowerCase']()['includes']("try again");
      if (v7 < v4 - 1 && v9) {
        await new Promise(v10 => setTimeout(v10, v5));
      } else {
        if (!v9) {
          throw v8;
        }
      }
    }
  }
  throw v6;
}
async function searchSpotify(v11) {
  return withRetry(async () => {
    const v12 = await axios.get("https://api.nexray.eu.cc/search/spotify?q=" + encodeURIComponent(v11), {
      'timeout': 0x7530
    });
    if (!v12.data?.["status"] || !Array.isArray(v12.data?.["result"]) || !v12.data.result.length) {
      throw new Error("No results found");
    }
    return v12.data.result.slice(0, 5);
  });
}
async function downloadSpotify(v13) {
  return withRetry(async () => {
    const v14 = await axios.get("https://api.nexray.eu.cc/downloader/spotifyplay?q=" + encodeURIComponent(v13), {
      'timeout': 0x15f90
    });
    const v15 = v14.data?.["result"];
    if (!v14.data?.["status"] || !v15?.["download_url"]) {
      throw new Error("Download API returned no URL");
    }
    return {
      'downloadUrl': v15.download_url,
      'title': v15.title || '',
      'artist': v15.artist || '',
      'album': v15.album || '',
      'duration': v15.duration || '',
      'thumbnail': v15.thumbnail || ''
    };
  });
}
function getTrackButtons(v16, v17) {
  const v18 = config.prefix || '.';
  return v16.map((v19, v20) => ({
    'id': v18 + "sptrack_" + v20 + '_' + v17,
    'text': v20 + 1 + ". " + v19.title.substring(0, 22) + (v19.title.length > 22 ? '…' : '')
  }));
}
function getFormatButtons(v21) {
  const v22 = config.prefix || '.';
  return [{
    'id': v22 + "spfmt_audio_" + v21,
    'text': "🎶 Audio"
  }, {
    'id': v22 + "spfmt_audiodoc_" + v21,
    'text': "📄 Audio Document"
  }];
}
module.exports = {
  'name': "spotify2",
  'aliases': ["sp2", "spdl2", 'spplay2'],
  'category': "media",
  'description': "Search and download Spotify songs",
  'usage': ".spotify <song name>",
  async 'execute'(v23, v24, v25, v26) {
    if (!v25.length) {
      return v26.reply("🎵 *Spotify Downloader*\n\n*Usage:*\n• `.spotify faded` — search + download\n• Reply to a message with `.spotify` — use replied text as query");
    }
    let v27 = v25.join(" ").trim();
    if (!v27) {
      const v28 = v26?.["quoted"];
      v27 = v28?.["conversation"] || v28?.["extendedTextMessage"]?.["text"] || '';
    }
    if (!v27) {
      return v26.reply("🎵 Provide a song name.\nExample: `.spotify Faded`");
    }
    if (v27.length > 100) {
      return v26.reply("📝 Song name too long! Max 100 chars.");
    }
    const v29 = v26.from;
    const v30 = config.prefix || '.';
    const v31 = v24.key.participant || v24.key.remoteJid;
    await v23.sendMessage(v29, {
      'react': {
        'text': '🔍',
        'key': v24.key
      }
    });
    let v32;
    try {
      v32 = await searchSpotify(v27);
    } catch (v33) {
      console.error("[spotify] search error:", v33.message);
      return v26.reply("❌ Search failed: " + v33.message);
    }
    const v34 = Date.now();
    const v35 = v32.map((v36, v37) => '*' + (v37 + 1) + ".* " + v36.title + "\n" + ("    ⏱ " + v36.duration + "  •  🔥 " + (v36.popularity ?? "N/A") + "  •  💿 " + v36.album)).join("\n\n");
    await sendButtons(v23, v29, {
      'title': "🎵 SPOTIFY SEARCH",
      'text': "*Query:* _" + v27 + "_\n\n" + (v35 + "\n\n") + "*Select a track to download:*",
      'footer': "Made by " + config.botName,
      'buttons': getTrackButtons(v32, v34)
    }, {
      'quoted': v24
    });
    await v23.sendMessage(v29, {
      'react': {
        'text': '✅',
        'key': v24.key
      }
    });
    const v38 = async v39 => {
      const v40 = v39.messages[0];
      if (!v40?.["message"]) {
        return;
      }
      const v41 = v40.message?.["buttonsResponseMessage"]?.["selectedButtonId"] || v40.message?.['templateButtonReplyMessage']?.["selectedId"] || v40.message?.["interactiveResponseMessage"]?.["nativeFlowResponseMessage"]?.["paramsJson"] || null;
      if (!v41) {
        return;
      }
      if (!v41.includes('sptrack_') || !v41.includes('_' + v34)) {
        return;
      }
      if (v40.key?.["remoteJid"] !== v29) {
        return;
      }
      const v42 = v40.key?.['participant'] || v40.key?.["remoteJid"];
      if (v29.endsWith("@g.us") && v42 !== v31) {
        return;
      }
      const v43 = v41.replace(v30, '').match(/^sptrack_(\d+)_/);
      if (!v43) {
        return;
      }
      const v44 = parseInt(v43[1]);
      const v45 = v32[v44];
      if (!v45) {
        return;
      }
      const v46 = Date.now();
      await sendButtons(v23, v29, {
        'title': "🎵 " + v45.title,
        'text': "⿻ *Title:*    " + v45.title + "\n" + ("⿻ *Artist:*   " + v45.artist + "\n") + ("⿻ *Album:*    " + v45.album + "\n") + ("⿻ *Duration:* " + v45.duration + "\n") + ("⿻ *Released:* " + (v45.release_date || "N/A") + "\n") + ("⿻ *Link:*     " + v45.url + "\n\n") + "*Select download format:*",
        'footer': "Made by " + config.botName,
        'buttons': getFormatButtons(v46)
      }, {
        'quoted': v40
      });
      await v23.sendMessage(v29, {
        'react': {
          'text': '⬇️',
          'key': v24.key
        }
      });
      const v47 = async v48 => {
        const v49 = v48.messages[0];
        if (!v49?.["message"]) {
          return;
        }
        const v50 = v49.message?.["buttonsResponseMessage"]?.["selectedButtonId"] || v49.message?.['templateButtonReplyMessage']?.["selectedId"] || v49.message?.["interactiveResponseMessage"]?.["nativeFlowResponseMessage"]?.["paramsJson"] || null;
        if (!v50) {
          return;
        }
        if (!v50.includes("spfmt_") || !v50.includes('_' + v46)) {
          return;
        }
        if (v49.key?.["remoteJid"] !== v29) {
          return;
        }
        const v51 = v49.key?.['participant'] || v49.key?.["remoteJid"];
        if (v29.endsWith("@g.us") && v51 !== v31) {
          return;
        }
        await v23.sendMessage(v29, {
          'react': {
            'text': '⏬',
            'key': v24.key
          }
        });
        try {
          const v52 = v50.replace(v30, '').split('_')[1];
          const v53 = v45.artist + " - " + v45.title;
          const v54 = await downloadSpotify(v53);
          const v55 = path.join(__dirname, 'temp');
          if (!fs.existsSync(v55)) {
            fs.mkdirSync(v55);
          }
          const v56 = path.join(v55, "sp_" + v46 + ".mp3");
          const v57 = await axios({
            'method': "get",
            'url': v54.downloadUrl,
            'responseType': "stream",
            'timeout': 0x927c0
          });
          const v58 = fs.createWriteStream(v56);
          v57.data.pipe(v58);
          await new Promise((v59, v60) => {
            v58.on("finish", v59);
            v58.on("error", v60);
          });
          if (!fs.existsSync(v56) || fs.statSync(v56).size === 0) {
            throw new Error("Download failed — file is empty");
          }
          const v61 = v54.title || v45.title || '';
          const v62 = v61.replace(/[^\w\s.-]/gi, '').substring(0, 100);
          if (v52 === "audio") {
            await v23.sendMessage(v29, {
              'audio': {
                'url': v56
              },
              'mimetype': "audio/mpeg"
            }, {
              'quoted': v49
            });
          } else if (v52 === 'audiodoc') {
            await v23.sendMessage(v29, {
              'document': {
                'url': v56
              },
              'mimetype': "audio/mpeg",
              'fileName': v62 + ".mp3",
              'caption': "> " + config.botName
            }, {
              'quoted': v49
            });
          }
          if (fs.existsSync(v56)) {
            fs.unlinkSync(v56);
          }
          await v23.sendMessage(v29, {
            'react': {
              'text': '✅',
              'key': v24.key
            }
          });
        } catch (v63) {
          console.error("[spotify] download error:", v63.message);
          await v23.sendMessage(v29, {
            'react': {
              'text': '❌',
              'key': v24.key
            }
          });
          await v23.sendMessage(v29, {
            'text': "🚫 Error: " + v63.message + "\n\n_Try again later._"
          }, {
            'quoted': v49
          });
        }
      };
      v23.ev.on('messages.upsert', v47);
    };
    v23.ev.on('messages.upsert', v38);
  }
};
