const axios = require("axios");
async function keithApi(v1, v2 = {}) {
  const v3 = "https://apiskeith2-production-ec66.up.railway.app" + v1;
  const {
    data: v4
  } = await axios.get(v3, {
    'params': v2,
    'timeout': 0x7530
  });
  if (!v4) {
    throw new Error("No response from API");
  }
  if (v4.status === false) {
    throw new Error(v4.error || v4.message || "API error");
  }
  return v4.result !== undefined ? v4.result : v4;
}
async function sendLong(v5, v6, v7, v8, v9 = "┗━━━━━━━━━━━━━━━━") {
  const v10 = v8.split("\n");
  const v11 = [];
  let v12 = '';
  for (const v13 of v10) {
    if ((v12 + v13 + "\n").length > 3500) {
      v11.push(v12);
      v12 = '';
    }
    v12 += v13 + "\n";
  }
  if (v12.trim()) {
    v11.push(v12);
  }
  if (!v11.length) {
    v11.push("_No data available_");
  }
  for (let v14 = 0; v14 < v11.length; v14++) {
    const v15 = v11.length > 1 ? " (" + (v14 + 1) + '/' + v11.length + ')' : '';
    const v16 = v14 === v11.length - 1;
    const v17 = (v14 === 0 ? '' + v7 + v15 + "\n\n" : '' + v7 + v15 + " cont...\n\n") + v11[v14] + (v16 ? "\n" + v9 : '');
    await v5.sendMessage(v6.key.remoteJid, {
      'text': v17
    }, {
      'quoted': v14 === 0 ? v6 : undefined
    });
  }
}
function fixRating(v18) {
  if (!v18) {
    return "N/A";
  }
  const v19 = String(v18);
  const v20 = v19.slice(0, Math.floor(v19.length / 2));
  return v20 === v19.slice(Math.floor(v19.length / 2)) ? v20 : v19;
}
function fmtIboxListing(v21, v22) {
  const v23 = (v21.trending || []).slice(0, 5);
  const v24 = (v21.items || []).slice(0, 8);
  const v25 = v21.page || 1;
  const v26 = v21.totalPages || '?';
  let v27 = '';
  if (v23.length) {
    v27 += "🔥 *Trending*\n";
    v27 += v23.map((v28, v29) => v29 + 1 + ". *" + v28.title + "*\n   🔗 " + v28.url).join("\n") + "\n\n";
  }
  if (v24.length) {
    v27 += "🆕 *Latest*\n";
    v27 += v24.map((v30, v31) => {
      let v32 = v31 + 1 + ". *" + v30.title + '*';
      if (v30.episode) {
        v32 += "\n   📺 " + v30.episode.replace(/\s+/g, " ").trim();
      }
      v32 += "\n   🔗 " + v30.url;
      return v32;
    }).join("\n");
  }
  v27 += "\n\n📄 Page " + v25 + " of " + v26;
  return v27;
}
function fmtDetail(v33) {
  let v34 = '';
  if (v33.title) {
    v34 += "🎬 *" + v33.title + "*\n";
  }
  if (v33.episodeTitle) {
    v34 += "📺 " + v33.episodeTitle + "\n";
  }
  if (v33.year) {
    v34 += "📅 Year: " + v33.year + "\n";
  }
  if (v33.rating) {
    v34 += "⭐ Rating: " + v33.rating + "/10\n";
  }
  if (v33.overview) {
    v34 += "\n📝 " + v33.overview.slice(0, 400).trim() + "\n";
  }
  if (v33.downloadUrl) {
    v34 += "\n📥 *Download:* " + v33.downloadUrl + "\n";
  }
  if (v33.telegramChannel) {
    v34 += "📢 Telegram: " + v33.telegramChannel + "\n";
  }
  if (v33.url) {
    v34 += "🔗 Source: " + v33.url + "\n";
  }
  return v34 || "_No details found_";
}
function fmtSearch(v35, v36) {
  const v37 = Array.isArray(v35) ? v35 : [];
  if (!v37.length) {
    return "_No " + v36 + " found_";
  }
  return v37.slice(0, 10).map((v38, v39) => {
    let v40 = v39 + 1 + ". *" + (v38.title || v38.name || "Untitled") + '*';
    if (v38.episode) {
      v40 += " — " + v38.episode.replace(/\s+/g, " ").trim();
    }
    if (v38.url) {
      v40 += "\n   🔗 " + v38.url;
    }
    return v40;
  }).join("\n");
}
function fmtMovieBoxSearch(v41) {
  const v42 = Array.isArray(v41.results) ? v41.results : [];
  if (!v42.length) {
    return "_No results found_";
  }
  return v42.slice(0, 10).map((v43, v44) => {
    let v45 = v44 + 1 + ". *" + v43.title + '*';
    if (v43.type) {
      v45 += " [" + v43.type + ']';
    }
    if (v43.rating) {
      v45 += " ⭐ " + fixRating(v43.rating);
    }
    if (v43.url) {
      v45 += "\n   🔗 " + v43.url;
    }
    return v45;
  }).join("\n");
}
function fmtActor(v46) {
  if (!v46.length) {
    return "_No actors found_";
  }
  return v46.slice(0, 5).map((v47, v48) => {
    let v49 = v48 + 1 + ". *" + v47.name + '*';
    if (v47.knownFor) {
      v49 += "\n   🎭 " + v47.knownFor;
    }
    if (v47.detailUrl) {
      v49 += "\n   🔗 " + v47.detailUrl;
    }
    return v49;
  }).join("\n\n");
}
function fmtTrailer(v50) {
  let v51 = '';
  if (v50.title) {
    v51 += "🎬 *" + v50.title + "*\n";
  }
  if (v50.description) {
    v51 += "\n📝 " + v50.description.slice(0, 300).trim() + "\n";
  }
  if (v50.thumbnail) {
    v51 += "\n🖼️ Thumbnail: " + v50.thumbnail + "\n";
  }
  if (v50.trailerUrl) {
    v51 += "\n▶️ *Trailer:* " + v50.trailerUrl + "\n";
  }
  if (v50.url) {
    v51 += "🔗 Source: " + v50.url + "\n";
  }
  return v51 || "_No trailer info found_";
}
module.exports = [{
  'name': "iboxtv",
  'aliases': ["tvtrending", "tvshows"],
  'description': "Trending TV shows from iBox",
  'category': "Movies",
  'usage': ".iboxtv [page]",
  'execute': async (v52, v53, v54) => {
    await v52.sendMessage(v53.key.remoteJid, {
      'react': {
        'text': '📺',
        'key': v53.key
      }
    });
    const v55 = parseInt(v54[0]) || 1;
    try {
      const v56 = await keithApi("/iboxtv", {
        'page': v55
      });
      const v57 = fmtIboxListing(v56, "TV Shows");
      await sendLong(v52, v53, "┏━━━ 📺 *iBox TV Trending* ━━━", v57);
    } catch (v58) {
      await v52.sendMessage(v53.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v53.key
        }
      });
      await v52.sendMessage(v53.key.remoteJid, {
        'text': "❌ " + v58.message
      }, {
        'quoted': v53
      });
    }
  }
}, {
  'name': 'tvdetail',
  'aliases': ["iboxtvdetail", "showdetail"],
  'description': "Get details and download link for a TV show",
  'category': "Movies",
  'usage': ".tvdetail <iboxtv_url>",
  'execute': async (v59, v60, v61) => {
    if (!v61[0]) {
      return v59.sendMessage(v60.key.remoteJid, {
        'text': "❌ Usage: .tvdetail <iboxtv_url>"
      }, {
        'quoted': v60
      });
    }
    await v59.sendMessage(v60.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v60.key
      }
    });
    const v62 = v61.join(" ").trim();
    try {
      const v63 = await keithApi("/iboxtv/detail", {
        'url': v62
      });
      const v64 = fmtDetail(v63);
      if (v63.image) {
        await v59.sendMessage(v60.key.remoteJid, {
          'image': {
            'url': v63.image
          },
          'caption': "┏━━━ 📺 *TV Show Detail* ━━━\n\n" + v64 + "\n┗━━━━━━━━━━━━━━━━"
        }, {
          'quoted': v60
        });
      } else {
        await sendLong(v59, v60, "┏━━━ 📺 *TV Show Detail* ━━━", v64);
      }
    } catch (v65) {
      await v59.sendMessage(v60.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v60.key
        }
      });
      await v59.sendMessage(v60.key.remoteJid, {
        'text': "❌ " + v65.message
      }, {
        'quoted': v60
      });
    }
  }
}, {
  'name': "tvsearch",
  'aliases': ["iboxsearch", "searchtv"],
  'description': "Search TV shows on iBox",
  'category': "Movies",
  'usage': ".tvsearch <query> [page]",
  'execute': async (v66, v67, v68) => {
    if (!v68[0]) {
      return v66.sendMessage(v67.key.remoteJid, {
        'text': "❌ Usage: .tvsearch <query>"
      }, {
        'quoted': v67
      });
    }
    await v66.sendMessage(v67.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v67.key
      }
    });
    const v69 = v68[v68.length - 1];
    const v70 = !isNaN(v69) && v68.length > 1;
    const v71 = v70 ? parseInt(v69) : 1;
    const v72 = v70 ? v68.slice(0, -1).join(" ") : v68.join(" ");
    try {
      const v73 = await keithApi("/iboxtv/search", {
        'q': v72,
        'page': v71
      });
      const v74 = v73.results || v73.items || v73 || [];
      const v75 = fmtSearch(Array.isArray(v74) ? v74 : [], "TV shows");
      await sendLong(v66, v67, "┏━━━ 🔍 *TV Search: \"" + v72 + "\"* ━━━", v75);
    } catch (v76) {
      await v66.sendMessage(v67.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v67.key
        }
      });
      await v66.sendMessage(v67.key.remoteJid, {
        'text': "❌ " + v76.message
      }, {
        'quoted': v67
      });
    }
  }
}, {
  'name': "iboxmovies",
  'aliases': ["movietrending", 'latestmovies'],
  'description': "Trending movies from iBox",
  'category': "Movies",
  'usage': ".iboxmovies [page]",
  'execute': async (v77, v78, v79) => {
    await v77.sendMessage(v78.key.remoteJid, {
      'react': {
        'text': '🎬',
        'key': v78.key
      }
    });
    const v80 = parseInt(v79[0]) || 1;
    try {
      const v81 = await keithApi('/iboxmovies', {
        'page': v80
      });
      const v82 = fmtIboxListing(v81, "Movies");
      await sendLong(v77, v78, "┏━━━ 🎬 *iBox Movies Trending* ━━━", v82);
    } catch (v83) {
      await v77.sendMessage(v78.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v78.key
        }
      });
      await v77.sendMessage(v78.key.remoteJid, {
        'text': "❌ " + v83.message
      }, {
        'quoted': v78
      });
    }
  }
}, {
  'name': "moviedetail",
  'aliases': ['iboxmoviedetail'],
  'description': "Get details and download link for a movie",
  'category': "Movies",
  'usage': ".moviedetail <iboxmovies_url>",
  'execute': async (v84, v85, v86) => {
    if (!v86[0]) {
      return v84.sendMessage(v85.key.remoteJid, {
        'text': "❌ Usage: .moviedetail <iboxmovies_url>"
      }, {
        'quoted': v85
      });
    }
    await v84.sendMessage(v85.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v85.key
      }
    });
    const v87 = v86.join(" ").trim();
    try {
      const v88 = await keithApi('/iboxmovies/detail', {
        'url': v87
      });
      const v89 = fmtDetail(v88);
      if (v88.image) {
        await v84.sendMessage(v85.key.remoteJid, {
          'image': {
            'url': v88.image
          },
          'caption': "┏━━━ 🎬 *Movie Detail* ━━━\n\n" + v89 + "\n┗━━━━━━━━━━━━━━━━"
        }, {
          'quoted': v85
        });
      } else {
        await sendLong(v84, v85, "┏━━━ 🎬 *Movie Detail* ━━━", v89);
      }
    } catch (v90) {
      await v84.sendMessage(v85.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v85.key
        }
      });
      await v84.sendMessage(v85.key.remoteJid, {
        'text': "❌ " + v90.message
      }, {
        'quoted': v85
      });
    }
  }
}, {
  'name': "moviesearch",
  'aliases': ["iboxmoviesearch", 'searchmovie'],
  'description': "Search movies on iBox",
  'category': "Movies",
  'usage': ".moviesearch <query> [page]",
  'execute': async (v91, v92, v93) => {
    if (!v93[0]) {
      return v91.sendMessage(v92.key.remoteJid, {
        'text': "❌ Usage: .moviesearch <query>"
      }, {
        'quoted': v92
      });
    }
    await v91.sendMessage(v92.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v92.key
      }
    });
    const v94 = v93[v93.length - 1];
    const v95 = !isNaN(v94) && v93.length > 1;
    const v96 = v95 ? parseInt(v94) : 1;
    const v97 = v95 ? v93.slice(0, -1).join(" ") : v93.join(" ");
    try {
      const v98 = await keithApi("/iboxmovies/search", {
        'q': v97,
        'page': v96
      });
      const v99 = v98.results || v98.items || v98 || [];
      const v100 = fmtSearch(Array.isArray(v99) ? v99 : [], "movies");
      await sendLong(v91, v92, "┏━━━ 🔍 *Movie Search: \"" + v97 + "\"* ━━━", v100);
    } catch (v101) {
      await v91.sendMessage(v92.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v92.key
        }
      });
      await v91.sendMessage(v92.key.remoteJid, {
        'text': "❌ " + v101.message
      }, {
        'quoted': v92
      });
    }
  }
}, {
  'name': "iboxanime",
  'aliases': ["animetrending", 'latestanime'],
  'description': "Trending anime from iBox",
  'category': "Movies",
  'usage': ".iboxanime [page]",
  'execute': async (v102, v103, v104) => {
    await v102.sendMessage(v103.key.remoteJid, {
      'react': {
        'text': '🎌',
        'key': v103.key
      }
    });
    const v105 = parseInt(v104[0]) || 1;
    try {
      const v106 = await keithApi("/iboxanime", {
        'page': v105
      });
      const v107 = fmtIboxListing(v106, "Anime");
      await sendLong(v102, v103, "┏━━━ 🎌 *iBox Anime Trending* ━━━", v107);
    } catch (v108) {
      await v102.sendMessage(v103.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v103.key
        }
      });
      await v102.sendMessage(v103.key.remoteJid, {
        'text': "❌ " + v108.message
      }, {
        'quoted': v103
      });
    }
  }
}, {
  'name': "animedetail",
  'aliases': ["iboxanimedetail"],
  'description': "Get details and download link for an anime",
  'category': 'Movies',
  'usage': ".animedetail <iboxanime_url>",
  'execute': async (v109, v110, v111) => {
    if (!v111[0]) {
      return v109.sendMessage(v110.key.remoteJid, {
        'text': "❌ Usage: .animedetail <iboxanime_url>"
      }, {
        'quoted': v110
      });
    }
    await v109.sendMessage(v110.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v110.key
      }
    });
    const v112 = v111.join(" ").trim();
    try {
      const v113 = await keithApi("/iboxanime/detail", {
        'url': v112
      });
      const v114 = fmtDetail(v113);
      if (v113.image) {
        await v109.sendMessage(v110.key.remoteJid, {
          'image': {
            'url': v113.image
          },
          'caption': "┏━━━ 🎌 *Anime Detail* ━━━\n\n" + v114 + "\n┗━━━━━━━━━━━━━━━━"
        }, {
          'quoted': v110
        });
      } else {
        await sendLong(v109, v110, "┏━━━ 🎌 *Anime Detail* ━━━", v114);
      }
    } catch (v115) {
      await v109.sendMessage(v110.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v110.key
        }
      });
      await v109.sendMessage(v110.key.remoteJid, {
        'text': "❌ " + v115.message
      }, {
        'quoted': v110
      });
    }
  }
}, {
  'name': "animesearch",
  'aliases': ["iboxanimesearch", 'searchanime'],
  'description': "Search anime on iBox",
  'category': 'Movies',
  'usage': ".animesearch <query> [page]",
  'execute': async (v116, v117, v118) => {
    if (!v118[0]) {
      return v116.sendMessage(v117.key.remoteJid, {
        'text': "❌ Usage: .animesearch <query>"
      }, {
        'quoted': v117
      });
    }
    await v116.sendMessage(v117.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v117.key
      }
    });
    const v119 = v118[v118.length - 1];
    const v120 = !isNaN(v119) && v118.length > 1;
    const v121 = v120 ? parseInt(v119) : 1;
    const v122 = v120 ? v118.slice(0, -1).join(" ") : v118.join(" ");
    try {
      const v123 = await keithApi("/iboxanime/search", {
        'q': v122,
        'page': v121
      });
      const v124 = v123.results || v123.items || v123 || [];
      const v125 = fmtSearch(Array.isArray(v124) ? v124 : [], "anime");
      await sendLong(v116, v117, "┏━━━ 🔍 *Anime Search: \"" + v122 + "\"* ━━━", v125);
    } catch (v126) {
      await v116.sendMessage(v117.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v117.key
        }
      });
      await v116.sendMessage(v117.key.remoteJid, {
        'text': "❌ " + v126.message
      }, {
        'quoted': v117
      });
    }
  }
}, {
  'name': 'dramabox',
  'aliases': ["drama", "dramastream"],
  'description': "Get DramaBox episode stream/download link",
  'category': 'Movies',
  'usage': ".dramabox <bookId> [episode]",
  'execute': async (v127, v128, v129) => {
    if (!v129[0]) {
      return v127.sendMessage(v128.key.remoteJid, {
        'text': "❌ Usage: .dramabox <bookId> [episode]\n\nExample: .dramabox 41000105764 1"
      }, {
        'quoted': v128
      });
    }
    await v127.sendMessage(v128.key.remoteJid, {
      'react': {
        'text': '🎭',
        'key': v128.key
      }
    });
    const v130 = v129[0];
    const v131 = parseInt(v129[1]) || 1;
    try {
      const v132 = await keithApi("/dramabox/stream", {
        'bookId': v130,
        'episode': v131
      });
      let v133 = "🎭 *DramaBox Stream*\n\n";
      v133 += "📚 Book ID: `" + v130 + "`\n";
      v133 += "📺 Episode: " + v131 + "\n";
      if (typeof v132 === "string") {
        v133 += "\n▶️ *Stream Link:*\n" + v132;
      } else {
        if (v132.url || v132.streamUrl || v132.link) {
          const v134 = v132.url || v132.streamUrl || v132.link;
          v133 += "\n▶️ *Stream Link:*\n" + v134;
          if (v132.title) {
            v133 += "\n\n🎬 " + v132.title;
          }
          if (v132.quality) {
            v133 += "\n📹 Quality: " + v132.quality;
          }
        } else {
          v133 += "\n📦 Response:\n" + JSON.stringify(v132, null, 2).slice(0, 800);
        }
      }
      await v127.sendMessage(v128.key.remoteJid, {
        'text': "┏━━━ 🎭 *DramaBox* ━━━\n\n" + v133 + "\n\n┗━━━━━━━━━━━━━━━━"
      }, {
        'quoted': v128
      });
    } catch (v135) {
      await v127.sendMessage(v128.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v128.key
        }
      });
      await v127.sendMessage(v128.key.remoteJid, {
        'text': "❌ " + v135.message
      }, {
        'quoted': v128
      });
    }
  }
}, {
  'name': 'actor',
  'aliases': ["actorsearch", 'findactor'],
  'description': "Search actors on IMDb",
  'category': "Movies",
  'usage': ".actor <name>",
  'execute': async (v136, v137, v138) => {
    if (!v138[0]) {
      return v136.sendMessage(v137.key.remoteJid, {
        'text': "❌ Usage: .actor <name>"
      }, {
        'quoted': v137
      });
    }
    await v136.sendMessage(v137.key.remoteJid, {
      'react': {
        'text': '🎭',
        'key': v137.key
      }
    });
    const v139 = v138.join(" ");
    try {
      const v140 = await keithApi("/actor/search", {
        'q': v139
      });
      const v141 = Array.isArray(v140) ? v140 : [];
      const v142 = fmtActor(v141);
      const v143 = v141.find(v144 => v144.image);
      if (v143?.["image"]) {
        await v136.sendMessage(v137.key.remoteJid, {
          'image': {
            'url': v143.image
          },
          'caption': "┏━━━ 🎭 *Actor Search: \"" + v139 + "\"* ━━━\n\n" + v142 + "\n\n┗━━━━━━━━━━━━━━━━"
        }, {
          'quoted': v137
        });
      } else {
        await sendLong(v136, v137, "┏━━━ 🎭 *Actor Search: \"" + v139 + "\"* ━━━", v142);
      }
    } catch (v145) {
      await v136.sendMessage(v137.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v137.key
        }
      });
      await v136.sendMessage(v137.key.remoteJid, {
        'text': "❌ " + v145.message
      }, {
        'quoted': v137
      });
    }
  }
}, {
  'name': "moviebox",
  'aliases': ['mbsearch', "mbmovie"],
  'description': "Search movies on MovieBox (returns URLs usable with .trailer / .moviedl)",
  'category': "Movies",
  'usage': ".moviebox <query>",
  'execute': async (v146, v147, v148) => {
    if (!v148[0]) {
      return v146.sendMessage(v147.key.remoteJid, {
        'text': "❌ Usage: .moviebox <query>"
      }, {
        'quoted': v147
      });
    }
    await v146.sendMessage(v147.key.remoteJid, {
      'react': {
        'text': '🎬',
        'key': v147.key
      }
    });
    const v149 = v148.join(" ");
    try {
      const v150 = await keithApi('/moviebox/search', {
        'q': v149
      });
      const v151 = fmtMovieBoxSearch(v150);
      await sendLong(v146, v147, "┏━━━ 🎬 *MovieBox: \"" + v149 + "\"* ━━━", v151, "\n💡 Use .trailer <url> to view info\n💡 Use .moviedl <url> to download trailer MP4\n┗━━━━━━━━━━━━━━━━");
    } catch (v152) {
      await v146.sendMessage(v147.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v147.key
        }
      });
      await v146.sendMessage(v147.key.remoteJid, {
        'text': "❌ " + v152.message
      }, {
        'quoted': v147
      });
    }
  }
}, {
  'name': 'trailer',
  'aliases': ['movietrailer', 'gettrailer'],
  'description': "Get movie trailer info from a MovieBox URL",
  'category': "Movies",
  'usage': ".trailer <moviebox_url>",
  'execute': async (v153, v154, v155) => {
    if (!v155[0]) {
      return v153.sendMessage(v154.key.remoteJid, {
        'text': "❌ Usage: .trailer <moviebox_url>\n\nGet URL from .moviebox <query>"
      }, {
        'quoted': v154
      });
    }
    await v153.sendMessage(v154.key.remoteJid, {
      'react': {
        'text': '▶️',
        'key': v154.key
      }
    });
    const v156 = v155.join(" ").trim();
    try {
      const v157 = await keithApi("/movie/trailer", {
        'q': v156
      });
      const v158 = fmtTrailer(v157);
      if (v157.thumbnail) {
        await v153.sendMessage(v154.key.remoteJid, {
          'image': {
            'url': v157.thumbnail
          },
          'caption': "┏━━━ ▶️ *Movie Trailer* ━━━\n\n" + v158 + "\n┗━━━━━━━━━━━━━━━━"
        }, {
          'quoted': v154
        });
      } else {
        await sendLong(v153, v154, "┏━━━ ▶️ *Movie Trailer* ━━━", v158);
      }
    } catch (v159) {
      await v153.sendMessage(v154.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v154.key
        }
      });
      await v153.sendMessage(v154.key.remoteJid, {
        'text': "❌ " + v159.message
      }, {
        'quoted': v154
      });
    }
  }
}, {
  'name': "moviedl",
  'aliases': ['trailerdownload', "dltrailer"],
  'description': "Download and send movie trailer MP4 from a MovieBox URL",
  'category': "Movies",
  'usage': ".moviedl <moviebox_url>",
  'execute': async (v160, v161, v162) => {
    if (!v162[0]) {
      return v160.sendMessage(v161.key.remoteJid, {
        'text': "❌ Usage: .moviedl <moviebox_url>\n\nGet URL from: .moviebox <query>"
      }, {
        'quoted': v161
      });
    }
    await v160.sendMessage(v161.key.remoteJid, {
      'react': {
        'text': '⬇️',
        'key': v161.key
      }
    });
    const v163 = v162.join(" ").trim();
    try {
      const v164 = await keithApi('/movie/trailer', {
        'q': v163
      });
      if (!v164.trailerUrl) {
        await v160.sendMessage(v161.key.remoteJid, {
          'react': {
            'text': '❌',
            'key': v161.key
          }
        });
        return v160.sendMessage(v161.key.remoteJid, {
          'text': "❌ No downloadable trailer MP4 found for this title.\n\n💡 Try .trailer <url> to see what info is available."
        }, {
          'quoted': v161
        });
      }
      const v165 = v164.title || "Movie Trailer";
      const v166 = v164.trailerUrl;
      await v160.sendMessage(v161.key.remoteJid, {
        'text': "┏━━━ ⬇️ *Downloading Trailer* ━━━\n\n" + ("🎬 *" + v165 + "*\n") + "📥 Fetching MP4, please wait...\n\n" + "┗━━━━━━━━━━━━━━━━"
      }, {
        'quoted': v161
      });
      let v167 = "┏━━━ 🎬 *Movie Trailer* ━━━\n\n" + ("🎬 *" + v165 + "*\n");
      if (v164.description) {
        v167 += "\n📝 " + v164.description.slice(0, 200).trim() + "\n";
      }
      v167 += "\n▶️ Enjoy the trailer!\n\n┗━━━━━━━━━━━━━━━━";
      await v160.sendMessage(v161.key.remoteJid, {
        'video': {
          'url': v166
        },
        'caption': v167,
        'mimetype': "video/mp4",
        'gifPlayback': false
      }, {
        'quoted': v161
      });
      await v160.sendMessage(v161.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v161.key
        }
      });
    } catch (v168) {
      await v160.sendMessage(v161.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v161.key
        }
      });
      await v160.sendMessage(v161.key.remoteJid, {
        'text': "❌ " + v168.message
      }, {
        'quoted': v161
      });
    }
  }
}];
