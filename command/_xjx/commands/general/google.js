const fetchJSON = async v1 => (await fetch(v1)).json();
const react = (v2, v3, v4) => v2.sendMessage(v3.key.remoteJid, {
  'react': {
    'text': v4,
    'key': v3.key
  }
});
const send = (v5, v6, v7) => v5.sendMessage(v6.key.remoteJid, {
  'text': v7
}, {
  'quoted': v6
});
module.exports = [{
  'name': "google",
  'aliases': ["search", 'g', 'gsearch'],
  'category': "general",
  'description': "Search Google and get top results",
  'usage': ".google <query>",
  async 'execute'(v8, v9, v10, v11) {
    const v12 = v10.join(" ").trim();
    if (!v12) {
      return v11.reply("❌ *Please provide a search query*\n\n*Usage:* .google <query>\n*Example:* .google How to learn JavaScript");
    }
    await react(v8, v9, '🔍');
    await v11.reply("⏳ *Searching Google...*");
    try {
      const v13 = await fetchJSON("https://api.giftedtech.co.ke/api/search/googlesearch?apikey=gifted&q=" + encodeURIComponent(v12));
      if (!v13.success || !v13.results?.["length"]) {
        await react(v8, v9, '❌');
        return v11.reply("❌ No results found for *\"" + v12 + "\"*");
      }
      const v14 = v13.results.slice(0, 5);
      let v15 = "🔍 *Google Search*\n" + ("📝 Query: *" + v12 + "*\n") + ("📊 Showing top *" + v14.length + "* results\n\n") + "━━━━━━━━━━━━━━━━━━\n\n";
      v14.forEach((v16, v17) => {
        v15 += '*' + (v17 + 1) + ". " + (v16.title || "No Title") + "*\n" + ("📄 " + (v16.description || v16.snippet || "No description available.") + "\n") + ("🔗 " + (v16.url || v16.link || "N/A") + "\n\n");
      });
      v15 += "━━━━━━━━━━━━━━━━━━\n_Powered by Google Search_";
      await send(v8, v9, v15);
      await react(v8, v9, '✅');
    } catch (v18) {
      console.error("[google]", v18.message);
      await react(v8, v9, '❌');
      v11.reply("❌ Search failed. Please try again later.");
    }
  }
}, {
  'name': "image2",
  'aliases': ["imagesearch2", "img2", "gimage"],
  'category': "general",
  'description': "Search Google Images and get top result",
  'usage': ".image <query>",
  async 'execute'(v19, v20, v21, v22) {
    const v23 = v21.join(" ").trim();
    if (!v23) {
      return v22.reply("❌ *Please provide a search query*\n\n*Usage:* .image <query>\n*Example:* .image sunset over mountains");
    }
    await react(v19, v20, '🖼️');
    await v22.reply("⏳ *Searching Google Images...*");
    try {
      const v24 = await fetchJSON("https://api.giftedtech.co.ke/api/search/googleimagesearch?apikey=gifted&q=" + encodeURIComponent(v23));
      if (!v24.success || !v24.results?.["length"]) {
        await react(v19, v20, '❌');
        return v22.reply("❌ No images found for *\"" + v23 + "\"*");
      }
      const v25 = v24.results.slice(0, 4);
      let v26 = 0;
      for (const v27 of v25) {
        const v28 = v27.image || v27.url || v27.thumbnail;
        if (!v28) {
          continue;
        }
        try {
          await v19.sendMessage(v20.key.remoteJid, {
            'image': {
              'url': v28
            },
            'caption': v26 === 0 ? "🖼️ *Google Images*\n🔍 Query: *" + v23 + "*\n\n_Result " + (v26 + 1) + " of " + v25.length + '_' : "_Result " + (v26 + 1) + " of " + v25.length + '_'
          }, {
            'quoted': v26 === 0 ? v20 : undefined
          });
          v26++;
        } catch {}
      }
      if (v26 === 0) {
        await react(v19, v20, '❌');
        return v22.reply("❌ Could not load any images. Please try again.");
      }
      await react(v19, v20, '✅');
    } catch (v29) {
      console.error("[image]", v29.message);
      await v19.sendMessage(v20.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v20.key
        }
      });
      v22.reply("❌ Image search failed. Please try again later.");
    }
  }
}, {
  'name': "define",
  'aliases': ["meaning", "definition", "dict"],
  'category': "general",
  'description': "Search Google for the definition of a word",
  'usage': ".define <word>",
  async 'execute'(v30, v31, v32, v33) {
    const v34 = v32.join(" ").trim();
    if (!v34) {
      return v33.reply("❌ *Please provide a word*\n\n*Usage:* .define <word>\n*Example:* .define photosynthesis");
    }
    await v30.sendMessage(v31.key.remoteJid, {
      'react': {
        'text': '📖',
        'key': v31.key
      }
    });
    try {
      const v35 = await fetchJSON('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(v34));
      if (!Array.isArray(v35) || !v35.length) {
        await v30.sendMessage(v31.key.remoteJid, {
          'react': {
            'text': '❌',
            'key': v31.key
          }
        });
        return v33.reply("❌ No definition found for *\"" + v34 + "\"*");
      }
      const v36 = v35[0];
      const v37 = v36.phonetic || v36.phonetics?.["find"](v38 => v38.text)?.["text"] || '';
      let v39 = "📖 *" + v36.word + "* " + (v37 ? '_(' + v37 + ')_' : '') + "\n\n";
      v36.meanings?.["slice"](0, 3)["forEach"](v40 => {
        v39 += "🔹 *" + v40.partOfSpeech + "*\n";
        v40.definitions?.["slice"](0, 2)["forEach"]((v41, v42) => {
          v39 += "   " + (v42 + 1) + ". " + v41.definition + "\n";
          if (v41.example) {
            v39 += "   _\"" + v41.example + "\"_\n";
          }
        });
        if (v40.synonyms?.['length']) {
          v39 += "   ✅ Synonyms: " + v40.synonyms.slice(0, 5).join(", ") + "\n";
        }
        if (v40.antonyms?.['length']) {
          v39 += "   ❌ Antonyms: " + v40.antonyms.slice(0, 5).join(", ") + "\n";
        }
        v39 += "\n";
      });
      v39 += "━━━━━━━━━━━━━━━━━━\n_Powered by Free Dictionary API_";
      await send(v30, v31, v39);
      await react(v30, v31, '✅');
    } catch (v43) {
      console.error("[define]", v43.message);
      await v30.sendMessage(v31.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v31.key
        }
      });
      v33.reply("❌ Definition lookup failed. Please try again later.");
    }
  }
}, {
  'name': "news2",
  'aliases': ["gnews", 'latestnews'],
  'category': 'general',
  'description': "Search Google News for latest articles",
  'usage': ".news <topic>",
  async 'execute'(v44, v45, v46, v47) {
    const v48 = v46.join(" ").trim();
    if (!v48) {
      return v47.reply("❌ *Please provide a news topic*\n\n*Usage:* .news <topic>\n*Example:* .news Kenya elections");
    }
    await react(v44, v45, '📰');
    await v47.reply("⏳ *Fetching latest news...*");
    try {
      const v49 = await fetchJSON("https://api.giftedtech.co.ke/api/search/googlenews?apikey=gifted&q=" + encodeURIComponent(v48));
      if (!v49.success || !v49.results?.["length"]) {
        await v44.sendMessage(v45.key.remoteJid, {
          'react': {
            'text': '❌',
            'key': v45.key
          }
        });
        return v47.reply("❌ No news found for *\"" + v48 + "\"*");
      }
      const v50 = v49.results.slice(0, 5);
      let v51 = "📰 *Google News*\n" + ("🔍 Topic: *" + v48 + "*\n\n") + "━━━━━━━━━━━━━━━━━━\n\n";
      v50.forEach((v52, v53) => {
        v51 += '*' + (v53 + 1) + ". " + (v52.title || "No Title") + "*\n" + ("🗞️ " + (v52.source || "Unknown Source") + "\n") + ("📅 " + (v52.date || v52.published || 'N/A') + "\n") + ("🔗 " + (v52.url || v52.link || 'N/A') + "\n\n");
      });
      v51 += "━━━━━━━━━━━━━━━━━━\n_Powered by Google News_";
      await v44.sendMessage(v45.key.remoteJid, {
        'text': v51
      }, {
        'quoted': v45
      });
      await v44.sendMessage(v45.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v45.key
        }
      });
    } catch (v54) {
      console.error("[news]", v54.message);
      await v44.sendMessage(v45.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v45.key
        }
      });
      v47.reply("❌ News search failed. Please try again later.");
    }
  }
}];
