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
async function sendLong(v5, v6, v7, v8, v9 = '┗━━━━━━━━━━━━━━━━') {
  const v10 = v8.split("\n");
  const v11 = [];
  let v12 = '';
  for (const v13 of v10) {
    if ((v12 + v13 + "\n").length > 4000) {
      if (v12) {
        v11.push(v12);
      }
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
    const v15 = v14 === 0;
    const v16 = v14 === v11.length - 1;
    const v17 = v11.length > 1 ? " (" + (v14 + 1) + '/' + v11.length + ')' : '';
    const v18 = '' + v7 + v17 + "\n\n" + v11[v14] + (v16 ? "\n" + v9 : "\n_continued..._");
    await v5.sendMessage(v6.key.remoteJid, {
      'text': v18
    }, {
      'quoted': v15 ? v6 : undefined
    });
    if (!v16) {
      await new Promise(v19 => setTimeout(v19, 800));
    }
  }
}
function fmtPlayers(v20) {
  const v21 = Array.isArray(v20) ? v20 : [];
  if (!v21.length) {
    return "_No players found_";
  }
  return v21.slice(0, 10).map((v22, v23) => {
    let v24 = '*' + (v23 + 1) + ". " + (v22.name || v22.strPlayer || "Unknown") + "*\n";
    if (v22.team) {
      v24 += "   🏟️ Team: " + v22.team + "\n";
    }
    if (v22.sport) {
      v24 += "   🏅 Sport: " + v22.sport + "\n";
    }
    if (v22.nationality) {
      v24 += "   🌍 Nationality: " + v22.nationality + "\n";
    }
    if (v22.position) {
      v24 += "   📍 Position: " + v22.position + "\n";
    }
    if (v22.birthDate) {
      v24 += "   🎂 Born: " + v22.birthDate + "\n";
    }
    if (v22.status) {
      v24 += "   ✅ Status: " + v22.status + "\n";
    }
    return v24;
  }).join("\n");
}
function fmtTeams(v25) {
  const v26 = Array.isArray(v25) ? v25 : [];
  if (!v26.length) {
    return "_No teams found_";
  }
  return v26.slice(0, 5).map((v27, v28) => {
    let v29 = '*' + (v28 + 1) + ". " + (v27.name || "Unknown") + "*\n";
    if (v27.league) {
      v29 += "   🏆 League: " + v27.league + "\n";
    }
    if (v27.sport) {
      v29 += "   🏅 Sport: " + v27.sport + "\n";
    }
    if (v27.stadium) {
      v29 += "   🏟️ Stadium: " + v27.stadium + "\n";
    }
    if (v27.stadiumCapacity) {
      v29 += "   👥 Capacity: " + Number(v27.stadiumCapacity).toLocaleString() + "\n";
    }
    if (v27.location) {
      v29 += "   📍 Location: " + v27.location + "\n";
    }
    if (v27.country) {
      v29 += "   🌍 Country: " + v27.country + "\n";
    }
    if (v27.formedYear) {
      v29 += "   📅 Founded: " + v27.formedYear + "\n";
    }
    if (v27.social?.["website"]) {
      v29 += "   🌐 " + v27.social.website + "\n";
    }
    if (v27.description) {
      v29 += "   📝 " + String(v27.description).slice(0, 200).trim() + "...\n";
    }
    return v29;
  }).join("\n");
}
function fmtVenues(v30) {
  const v31 = Array.isArray(v30) ? v30 : [];
  if (!v31.length) {
    return "_No venues found_";
  }
  return v31.slice(0, 5).map((v32, v33) => {
    let v34 = '*' + (v33 + 1) + ". " + (v32.name || "Unknown") + "*\n";
    if (v32.sport) {
      v34 += "   🏅 Sport: " + v32.sport + "\n";
    }
    if (v32.capacity) {
      v34 += "   👥 Capacity: " + Number(v32.capacity).toLocaleString() + "\n";
    }
    if (v32.location) {
      v34 += "   📍 Location: " + v32.location + "\n";
    }
    if (v32.country) {
      v34 += "   🌍 Country: " + v32.country + "\n";
    }
    if (v32.description) {
      v34 += "   📝 " + String(v32.description).slice(0, 200).trim() + "...\n";
    }
    return v34;
  }).join("\n");
}
function fmtGameEvents(v35) {
  const v36 = Array.isArray(v35) ? v35 : [];
  if (!v36.length) {
    return "_No events found_";
  }
  return v36.slice(0, 10).map(v37 => {
    const v38 = v37.teams?.["home"]?.['name'] || v37.homeTeam || '?';
    const v39 = v37.teams?.["away"]?.["name"] || v37.awayTeam || '?';
    const v40 = v37.teams?.["home"]?.["score"];
    const v41 = v37.teams?.['away']?.["score"];
    const v42 = v37.dateTime?.["date"] || v37.date || '';
    const v43 = v37.dateTime?.["time"]?.["slice"](0, 5) || '';
    const v44 = v37.venue?.["name"] || '';
    const v45 = v37.status || '';
    const v46 = v37.season || '';
    let v47 = "┏ *" + v38 + "* vs *" + v39 + "*\n";
    if (v40 !== null && v40 !== undefined && v41 !== null && v41 !== undefined) {
      v47 += "┃ 📊 Score: " + v40 + " - " + v41 + "\n";
    }
    if (v42) {
      v47 += "┃ 📅 " + v42 + (v43 ? " " + v43 : '') + "\n";
    }
    if (v44) {
      v47 += "┃ 🏟️ " + v44 + "\n";
    }
    if (v45) {
      v47 += "┃ 🔄 " + v45 + "\n";
    }
    if (v46) {
      v47 += "┃ 📋 Season: " + v46 + "\n";
    }
    v47 += "┗━━━━━━━━━━━━━━━\n";
    return v47;
  }).join("\n");
}
function fmtStandings(v48) {
  const v49 = v48?.['standings'] || (Array.isArray(v48) ? v48 : []);
  if (!v49.length) {
    return "_No standings data available_";
  }
  const v50 = v48?.["competition"] ? v48.competition + "\n\n" : '';
  const v51 = v49.slice(0, 25).map(v52 => {
    const v53 = String(v52.position || '').padStart(2);
    const v54 = (v52.team || v52.name || '?').padEnd(28);
    const v55 = v52.played ?? v52.mp ?? 0;
    const v56 = v52.won ?? v52.w ?? 0;
    const v57 = v52.draw ?? v52.drawn ?? v52.d ?? 0;
    const v58 = v52.lost ?? v52.l ?? 0;
    const v59 = v52.points ?? v52.pts ?? 0;
    const v60 = v52.goalDifference ?? v52.gd ?? '';
    return v53 + ". " + v54 + " P" + v55 + " W" + v56 + " D" + v57 + " L" + v58 + (v60 !== '' ? " GD" + v60 : '') + " | *" + v59 + "pts*";
  });
  return v50 + v51.join("\n");
}
function fmtScorers(v61) {
  const v62 = v61?.["topScorers"] || v61?.['scorers'] || (Array.isArray(v61) ? v61 : []);
  if (!v62.length) {
    return "_No scorers data available_";
  }
  const v63 = v61?.["competition"] ? v61.competition + "\n\n" : '';
  const v64 = v62.slice(0, 20).map((v65, v66) => {
    const v67 = v65.rank || v65.position || v66 + 1;
    const v68 = v65.player || v65.name || v65.strPlayer || '?';
    const v69 = v65.team || v65.club || '';
    const v70 = v65.goals ?? v65.scored ?? v65.numberOfGoals ?? '?';
    const v71 = v65.assists ?? '';
    let v72 = '*' + v67 + ".* ⚽ " + v68 + (v69 ? " (" + v69 + ')' : '') + "\n";
    v72 += "    Goals: *" + v70 + '*' + (v71 !== '' ? " │ Assists: " + v71 : '') + "\n";
    return v72;
  });
  return v63 + v64.join('');
}
function fmtMatches(v73) {
  const v74 = v73?.["upcomingMatches"] || v73?.["matches"] || v73?.['fixtures'] || (Array.isArray(v73) ? v73 : []);
  if (!v74.length) {
    return "_No matches data available_";
  }
  const v75 = v73?.["competition"] ? v73.competition + "\n\n" : '';
  const v76 = v74.slice(0, 15).map(v77 => {
    const v78 = v77.homeTeam || v77.home || v77.team1 || '?';
    const v79 = v77.awayTeam || v77.away || v77.team2 || '?';
    const v80 = v77.score || (v77.homeScore !== undefined ? v77.homeScore + " - " + v77.awayScore : null);
    const v81 = v77.date || v77.utcDate || '';
    const v82 = v77.matchday ? 'MD' + v77.matchday : '';
    let v83 = "┏ " + v78 + " vs " + v79 + "\n";
    if (v80) {
      v83 += "┃ 📊 " + v80 + "\n";
    }
    if (v82) {
      v83 += "┃ 📋 " + v82 + "\n";
    }
    if (v81) {
      v83 += "┃ 📅 " + v81 + "\n";
    }
    v83 += "┗━━━━━━━━━━━━━━━\n";
    return v83;
  });
  return v75 + v76.join("\n");
}
function fmtFifaUpcoming(v84) {
  const v85 = v84?.["upcomingMatches"] || (Array.isArray(v84) ? v84 : []);
  if (!v85.length) {
    return "_No upcoming FIFA World Cup matches found_";
  }
  const v86 = v84?.["competition"] ? "🌍 *" + v84.competition + "*\n\n" : '';
  const v87 = v85.map((v88, v89) => {
    const v90 = v88.homeTeam || "TBD";
    const v91 = v88.awayTeam || "TBD";
    const v92 = v88.matchday && v88.matchday !== "N/A" ? 'MD' + v88.matchday : '';
    const v93 = v88.date || '';
    let v94 = "┏ *Match " + (v89 + 1) + "*\n";
    v94 += "┃ ⚔️ " + v90 + " vs " + v91 + "\n";
    if (v93) {
      v94 += "┃ 📅 " + v93 + "\n";
    }
    if (v92) {
      v94 += "┃ 📋 " + v92 + "\n";
    }
    v94 += "┗━━━━━━━━━━━━━━━\n";
    return v94;
  });
  return v86 + v87.join("\n");
}
function fmtFifaMatches(v95) {
  const v96 = v95?.["matches"] || (Array.isArray(v95) ? v95 : []);
  if (!v96.length) {
    return "_No FIFA World Cup match results found_";
  }
  const v97 = v95?.["competition"] ? "🌍 *" + v95.competition + "*\n\n" : '';
  const v98 = v96.map((v99, v100) => {
    const v101 = v99.homeTeam || "TBD";
    const v102 = v99.awayTeam || "TBD";
    const v103 = v99.matchday ? 'MD' + v99.matchday : '';
    const v104 = v99.score || '';
    const v105 = v99.status || '';
    const v106 = v99.winner || '';
    let v107 = "┏ *Match " + (v100 + 1) + "*\n";
    v107 += "┃ ⚔️ " + v101 + " vs " + v102 + "\n";
    if (v104) {
      v107 += "┃ 📊 Score: *" + v104 + "*\n";
    }
    if (v103) {
      v107 += "┃ 📋 " + v103 + "\n";
    }
    if (v105) {
      v107 += "┃ 🔄 " + v105 + "\n";
    }
    if (v106) {
      v107 += "┃ 🏆 " + (v106 === 'Draw' ? 'Draw' : "Winner: " + v106) + "\n";
    }
    v107 += "┗━━━━━━━━━━━━━━━\n";
    return v107;
  });
  return v97 + v98.join("\n");
}
function fmtFifaStandings(v108) {
  const v109 = v108?.["standings"] || (Array.isArray(v108) ? v108 : []);
  if (!v109.length) {
    return "_No FIFA World Cup standings found_";
  }
  const v110 = v108?.["competition"] ? "🌍 *" + v108.competition + "*\n\n" : '';
  let v111 = '';
  for (let v112 = 0; v112 < v109.length; v112 += 4) {
    const v113 = v109.slice(v112, v112 + 4);
    const v114 = v109.length > 4 ? "🔷 *GROUP " + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(v112 / 4)] + "*\n" : '';
    v111 += v114;
    v111 += '─'.repeat(46) + "\n";
    v111 += "  Team                   MP  W  D  L GF GA GD Pts\n";
    v111 += '─'.repeat(46) + "\n";
    v113.forEach((v115, v116) => {
      const v117 = v116 < 2 ? '✅' : '❌';
      const v118 = (v115.team || '?').padEnd(20);
      const v119 = String(v115.played ?? 0).padStart(2);
      const v120 = String(v115.won ?? 0).padStart(2);
      const v121 = String(v115.draw ?? 0).padStart(2);
      const v122 = String(v115.lost ?? 0).padStart(2);
      const v123 = String(v115.goalsFor ?? 0).padStart(3);
      const v124 = String(v115.goalsAgainst ?? 0).padStart(3);
      const v125 = String(v115.goalDifference ?? 0).padStart(3);
      const v126 = String(v115.points ?? 0).padStart(3);
      v111 += v117 + " " + v118 + v119 + " " + v120 + " " + v121 + " " + v122 + v123 + v124 + v125 + v126 + "\n";
    });
    v111 += "\n";
  }
  return v110 + v111.trim();
}
function fmtFifaScorers(v127) {
  const v128 = v127?.["topScorers"] || (Array.isArray(v127) ? v127 : []);
  if (!v128.length) {
    return "_No FIFA World Cup top scorers found_";
  }
  const v129 = v127?.["competition"] ? "🌍 *" + v127.competition + "*\n\n" : '';
  const v130 = v128.map((v131, v132) => {
    const v133 = v131.rank || v132 + 1;
    const v134 = v131.player || '?';
    const v135 = v131.team || '';
    const v136 = v131.goals ?? '?';
    const v137 = v131.assists;
    const v138 = v131.penalties;
    let v139 = '*' + v133 + ".* ⚽ " + v134 + (v135 ? " (" + v135 + ')' : '') + "\n";
    v139 += "    Goals: *" + v136 + '*';
    if (v137 !== undefined && v137 !== "N/A") {
      v139 += " │ Assists: " + v137;
    }
    if (v138 !== undefined && v138 !== "N/A") {
      v139 += " │ Penalties: " + v138;
    }
    v139 += "\n";
    return v139;
  });
  return v129 + v130.join('');
}
function fmtLivescore(v140) {
  const v141 = v140?.["games"] || v140;
  let v142 = Array.isArray(v141) ? v141 : Object.values(v141 || {});
  if (!v142.length) {
    return "_No live games right now_";
  }
  return v142.slice(0, 20).map(v143 => {
    const v144 = v143.p1 || v143.home || '?';
    const v145 = v143.p2 || v143.away || '?';
    const v146 = v143.R?.['r1'] ?? v143.homeScore ?? '';
    const v147 = v143.R?.['r2'] ?? v143.awayScore ?? '';
    const v148 = v143.R?.['st'] || v143.status || '';
    const v149 = v143.dt || '';
    const v150 = v143.tm || '';
    let v151 = "┏ " + v144 + " *" + v146 + "* - *" + v147 + "* " + v145 + "\n";
    if (v148) {
      v151 += "┃ ⏱ " + v148 + "\n";
    }
    if (v149) {
      v151 += "┃ 📅 " + v149 + (v150 ? " " + v150 : '') + "\n";
    }
    v151 += "┗━━━━━━━━━━━━━━━\n";
    return v151;
  }).join("\n");
}
function fmtLivescore2(v152) {
  const v153 = v152?.["data"]?.["list"] || v152?.["list"] || (Array.isArray(v152) ? v152 : []);
  if (!v153.length) {
    return "_No live highlights right now_";
  }
  return v153.slice(0, 15).map(v154 => {
    const v155 = v154.team1?.['name'] || '?';
    const v156 = v154.team2?.["name"] || '?';
    const v157 = v154.team1?.["score"] ?? '';
    const v158 = v154.team2?.["score"] ?? '';
    const v159 = v154.status || '';
    let v160 = "┏ " + v155 + " *" + v157 + "* - *" + v158 + "* " + v156 + "\n";
    if (v159) {
      v160 += "┃ 🔴 " + v159 + "\n";
    }
    if (v154.playPath) {
      v160 += "┃ 🎬 " + v154.playPath + "\n";
    }
    v160 += "┗━━━━━━━━━━━━━━━\n";
    return v160;
  }).join("\n");
}
function fmtNews(v161) {
  const v162 = v161?.["data"]?.['items'] || v161?.["items"] || (Array.isArray(v161) ? v161 : []);
  if (!v162.length) {
    return "_No news available_";
  }
  return v162.slice(0, 10).map((v163, v164) => {
    const v165 = v163.title || v163.headline || '';
    const v166 = v163.summary || v163.description || '';
    const v167 = v163.date || (v163.createdAt ? new Date(Number(v163.createdAt)).toLocaleDateString() : '');
    let v168 = '*' + (v164 + 1) + ". " + v165 + "*\n";
    if (v167) {
      v168 += "📅 " + v167 + "\n";
    }
    if (v166) {
      v168 += String(v166).slice(0, 250) + "\n";
    }
    return v168 + "\n";
  }).join('');
}
function fmtBet(v169) {
  const v170 = Array.isArray(v169) ? v169 : v169?.["tips"] || v169?.['bets'] || [];
  if (!v170.length) {
    return "_No bet tips available right now. Try again later._";
  }
  return v170.slice(0, 15).map((v171, v172) => {
    const v173 = v171.match || v171.game || v171.fixture || "Match " + (v172 + 1);
    const v174 = v171.tip || v171.prediction || v171.pick || '';
    const v175 = v171.odds || v171.odd || '';
    const v176 = v171.confidence || v171.probability || '';
    let v177 = '*' + (v172 + 1) + ". " + v173 + "*\n";
    if (v174) {
      v177 += "   🎯 Tip: " + v174 + "\n";
    }
    if (v175) {
      v177 += "   💰 Odds: " + v175 + "\n";
    }
    if (v176) {
      v177 += "   📊 Confidence: " + v176 + "\n";
    }
    return v177;
  }).join("\n");
}
async function leagueHandler(v178, v179, v180, v181, v182, v183) {
  const v184 = (v180[0] || '').toLowerCase();
  const v185 = Object.keys(v183);
  if (!v184 || !v185.includes(v184)) {
    return v178.sendMessage(v179.key.remoteJid, {
      'text': "┏━━『 " + v182 + " 』━━\n\n" + ("Usage: ." + v181.command + " <option>\n\n") + "Options:\n" + v185.map(v186 => "  • *" + v186 + '*').join("\n") + "\n\n┗━━━━━━━━━━━━━━━━"
    }, {
      'quoted': v179
    });
  }
  await v178.sendMessage(v179.key.remoteJid, {
    'react': {
      'text': '⏳',
      'key': v179.key
    }
  });
  try {
    const {
      endpoint: v187,
      format: v188,
      title: v189
    } = v183[v184];
    const v190 = await keithApi(v187);
    const v191 = v188(v190);
    await sendLong(v178, v179, "┏━━『 " + v182 + " — " + v189 + " 』━━", v191);
    await v178.sendMessage(v179.key.remoteJid, {
      'react': {
        'text': '✅',
        'key': v179.key
      }
    });
  } catch (v192) {
    console.error('[' + v182 + '/' + v184 + ']', v192.message);
    await v178.sendMessage(v179.key.remoteJid, {
      'react': {
        'text': '❌',
        'key': v179.key
      }
    });
    v181.reply("❌ " + v182 + " " + v184 + " failed: " + v192.message);
  }
}
module.exports = [{
  'name': "playersearch",
  'aliases': ['psearch', "kplayer"],
  'category': "sports",
  'description': "Search for any sport player",
  'usage': ".playersearch <player name>",
  async 'execute'(v193, v194, v195, v196) {
    const v197 = v195.join(" ").trim();
    if (!v197) {
      return v196.reply("❌ Provide a player name.\n\nExample: *.playersearch Bukayo Saka*");
    }
    await v193.sendMessage(v194.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v194.key
      }
    });
    try {
      const v198 = await keithApi("/sport/playersearch", {
        'q': v197
      });
      await sendLong(v193, v194, "┏━━『 🔍 Player Search: \"" + v197 + "\" 』━━", fmtPlayers(v198));
      await v193.sendMessage(v194.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v194.key
        }
      });
    } catch (v199) {
      await v193.sendMessage(v194.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v194.key
        }
      });
      v196.reply("❌ Search failed: " + v199.message);
    }
  }
}, {
  'name': 'kteamsearch',
  'aliases': ["tsearch", "kteam"],
  'category': 'sports',
  'description': "Search for any sport team",
  'usage': ".kteamsearch <team name>",
  async 'execute'(v200, v201, v202, v203) {
    const v204 = v202.join(" ").trim();
    if (!v204) {
      return v203.reply("❌ Provide a team name.\n\nExample: *.kteamsearch Arsenal*");
    }
    await v200.sendMessage(v201.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v201.key
      }
    });
    try {
      const v205 = await keithApi("/sport/teamsearch", {
        'q': v204
      });
      await sendLong(v200, v201, "┏━━『 🔍 Team Search: \"" + v204 + "\" 』━━", fmtTeams(v205));
      await v200.sendMessage(v201.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v201.key
        }
      });
    } catch (v206) {
      await v200.sendMessage(v201.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v201.key
        }
      });
      v203.reply("❌ Search failed: " + v206.message);
    }
  }
}, {
  'name': 'venuesearch',
  'aliases': ['stadium', "findvenue"],
  'category': 'sports',
  'description': "Search for a stadium/venue",
  'usage': ".venuesearch <venue name>",
  async 'execute'(v207, v208, v209, v210) {
    const v211 = v209.join(" ").trim();
    if (!v211) {
      return v210.reply("❌ Provide a venue name.\n\nExample: *.venuesearch Emirates*");
    }
    await v207.sendMessage(v208.key.remoteJid, {
      'react': {
        'text': '🔍',
        'key': v208.key
      }
    });
    try {
      const v212 = await keithApi('/sport/venuesearch', {
        'q': v211
      });
      await sendLong(v207, v208, "┏━━『 🏟️ Venue Search: \"" + v211 + "\" 』━━", fmtVenues(v212));
      await v207.sendMessage(v208.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v208.key
        }
      });
    } catch (v213) {
      await v207.sendMessage(v208.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v208.key
        }
      });
      v210.reply("❌ Search failed: " + v213.message);
    }
  }
}, {
  'name': "gameevents",
  'aliases': ["matchhistory", "h2h"],
  'category': 'sports',
  'description': "Game events/history between two teams",
  'usage': ".gameevents <team vs team>",
  async 'execute'(v214, v215, v216, v217) {
    const v218 = v216.join(" ").trim();
    if (!v218) {
      return v217.reply("❌ Provide a match query.\n\nExample: *.gameevents Arsenal vs Chelsea*");
    }
    await v214.sendMessage(v215.key.remoteJid, {
      'react': {
        'text': '⏳',
        'key': v215.key
      }
    });
    try {
      const v219 = await keithApi("/sport/gameevents", {
        'q': v218
      });
      await sendLong(v214, v215, "┏━━『 📋 Game Events: \"" + v218 + "\" 』━━", fmtGameEvents(v219));
      await v214.sendMessage(v215.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v215.key
        }
      });
    } catch (v220) {
      await v214.sendMessage(v215.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v215.key
        }
      });
      v217.reply("❌ Failed: " + v220.message);
    }
  }
}, {
  'name': "fifaupcoming",
  'aliases': ["wcupcoming", "fifafixtures", "worldcupfixtures"],
  'category': "sports",
  'description': "FIFA World Cup — upcoming matches",
  'usage': ".fifaupcoming",
  async 'execute'(v221, v222, v223, v224) {
    await v221.sendMessage(v222.key.remoteJid, {
      'react': {
        'text': '⏳',
        'key': v222.key
      }
    });
    try {
      const v225 = await keithApi('/fifa/upcomingmatches');
      await sendLong(v221, v222, "┏━━『 🌍 FIFA World Cup — Upcoming Matches 』━━", fmtFifaUpcoming(v225));
      await v221.sendMessage(v222.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v222.key
        }
      });
    } catch (v226) {
      console.error('[fifaupcoming]', v226.message);
      await v221.sendMessage(v222.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v222.key
        }
      });
      v224.reply("❌ Failed to fetch upcoming FIFA matches: " + v226.message);
    }
  }
}, {
  'name': "fifamatches",
  'aliases': ["wcmatches", 'fifaresults', 'worldcupresults'],
  'category': "sports",
  'description': "FIFA World Cup — match results",
  'usage': ".fifamatches",
  async 'execute'(v227, v228, v229, v230) {
    await v227.sendMessage(v228.key.remoteJid, {
      'react': {
        'text': '⏳',
        'key': v228.key
      }
    });
    try {
      const v231 = await keithApi("/fifa/matches");
      await sendLong(v227, v228, "┏━━『 🌍 FIFA World Cup — Match Results 』━━", fmtFifaMatches(v231));
      await v227.sendMessage(v228.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v228.key
        }
      });
    } catch (v232) {
      console.error("[fifamatches]", v232.message);
      await v227.sendMessage(v228.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v228.key
        }
      });
      v230.reply("❌ Failed to fetch FIFA match results: " + v232.message);
    }
  }
}, {
  'name': 'fifastandings',
  'aliases': ["wcstandings", "fifatable", "worldcupstandings"],
  'category': "sports",
  'description': "FIFA World Cup — group standings",
  'usage': ".fifastandings",
  async 'execute'(v233, v234, v235, v236) {
    await v233.sendMessage(v234.key.remoteJid, {
      'react': {
        'text': '⏳',
        'key': v234.key
      }
    });
    try {
      const v237 = await keithApi("/fifa/standings");
      await sendLong(v233, v234, "┏━━『 🌍 FIFA World Cup — Standings 』━━", fmtFifaStandings(v237));
      await v233.sendMessage(v234.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v234.key
        }
      });
    } catch (v238) {
      console.error("[fifastandings]", v238.message);
      await v233.sendMessage(v234.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v234.key
        }
      });
      v236.reply("❌ Failed to fetch FIFA standings: " + v238.message);
    }
  }
}, {
  'name': "fifascorers",
  'aliases': ["wcscorers", "fifatopscorers", "worldcupscorers"],
  'category': "sports",
  'description': "FIFA World Cup — top scorers",
  'usage': ".fifascorers",
  async 'execute'(v239, v240, v241, v242) {
    await v239.sendMessage(v240.key.remoteJid, {
      'react': {
        'text': '⏳',
        'key': v240.key
      }
    });
    try {
      const v243 = await keithApi("/fifa/scorers");
      await sendLong(v239, v240, "┏━━『 🌍 FIFA World Cup — Top Scorers 』━━", fmtFifaScorers(v243));
      await v239.sendMessage(v240.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v240.key
        }
      });
    } catch (v244) {
      console.error("[fifascorers]", v244.message);
      await v239.sendMessage(v240.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v240.key
        }
      });
      v242.reply("❌ Failed to fetch FIFA top scorers: " + v244.message);
    }
  }
}, {
  'name': "livescore",
  'aliases': ["live", "liveresults"],
  'category': "sports",
  'description': "Get current football live scores",
  'usage': ".livescore",
  async 'execute'(v245, v246, v247, v248) {
    await v245.sendMessage(v246.key.remoteJid, {
      'react': {
        'text': '⏳',
        'key': v246.key
      }
    });
    try {
      const v249 = await keithApi("/livescore");
      await sendLong(v245, v246, "┏━━『 🔴 LIVE SCORES 』━━", fmtLivescore(v249));
      await v245.sendMessage(v246.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v246.key
        }
      });
    } catch (v250) {
      await v245.sendMessage(v246.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v246.key
        }
      });
      v248.reply("❌ Failed: " + v250.message);
    }
  }
}, {
  'name': "livehighlights",
  'aliases': ["livescore2", "livehl"],
  'category': 'sports',
  'description': "Get live scores with highlight stream links",
  'usage': '.livehighlights',
  async 'execute'(v251, v252, v253, v254) {
    await v251.sendMessage(v252.key.remoteJid, {
      'react': {
        'text': '⏳',
        'key': v252.key
      }
    });
    try {
      const v255 = await keithApi("/livescore2");
      await sendLong(v251, v252, "┏━━『 🔴 LIVE SCORES + HIGHLIGHTS 』━━", fmtLivescore2(v255));
      await v251.sendMessage(v252.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v252.key
        }
      });
    } catch (v256) {
      await v251.sendMessage(v252.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v252.key
        }
      });
      v254.reply("❌ Failed: " + v256.message);
    }
  }
}, {
  'name': "epl",
  'aliases': ["premierleague", 'pl'],
  'category': "sports",
  'description': "EPL — upcoming, matches, standings, scorers",
  'usage': ".epl <upcoming|matches|standings|scorers>",
  async 'execute'(v257, v258, v259, v260) {
    await leagueHandler(v257, v258, v259, v260, "⚽ Premier League", {
      'upcoming': {
        'endpoint': "/epl/upcomingmatches",
        'format': fmtMatches,
        'title': "Upcoming Matches"
      },
      'matches': {
        'endpoint': '/epl/matches',
        'format': fmtMatches,
        'title': 'Matches'
      },
      'standings': {
        'endpoint': "/epl/standings",
        'format': fmtStandings,
        'title': "Standings"
      },
      'scorers': {
        'endpoint': '/epl/scorers',
        'format': fmtScorers,
        'title': "Top Scorers"
      }
    });
  }
}, {
  'name': "bundesliga",
  'aliases': ["bund", "germansoccer"],
  'category': "sports",
  'description': "Bundesliga — upcoming, matches, standings, scorers",
  'usage': ".bundesliga <upcoming|matches|standings|scorers>",
  async 'execute'(v261, v262, v263, v264) {
    await leagueHandler(v261, v262, v263, v264, "🇩🇪 Bundesliga", {
      'upcoming': {
        'endpoint': '/bundesliga/upcomingmatches',
        'format': fmtMatches,
        'title': "Upcoming Matches"
      },
      'matches': {
        'endpoint': "/bundesliga/matches",
        'format': fmtMatches,
        'title': "Matches"
      },
      'standings': {
        'endpoint': '/bundesliga/standings',
        'format': fmtStandings,
        'title': "Standings"
      },
      'scorers': {
        'endpoint': "/bundesliga/scorers",
        'format': fmtScorers,
        'title': "Top Scorers"
      }
    });
  }
}, {
  'name': 'euros',
  'aliases': ["eurocup", 'euro'],
  'category': "sports",
  'description': "Euros — upcoming, matches, standings, scorers",
  'usage': ".euros <upcoming|matches|standings|scorers>",
  async 'execute'(v265, v266, v267, v268) {
    await leagueHandler(v265, v266, v267, v268, "🏆 Euros", {
      'upcoming': {
        'endpoint': "/euros/upcomingmatches",
        'format': fmtMatches,
        'title': "Upcoming Matches"
      },
      'matches': {
        'endpoint': "/euros/matches",
        'format': fmtMatches,
        'title': "Matches"
      },
      'standings': {
        'endpoint': "/euros/standings",
        'format': fmtStandings,
        'title': 'Standings'
      },
      'scorers': {
        'endpoint': "/euros/scorers",
        'format': fmtScorers,
        'title': "Top Scorers"
      }
    });
  }
}, {
  'name': 'laliga',
  'aliases': ['ll', 'spanishleague'],
  'category': "sports",
  'description': "La Liga — upcoming, matches, standings, scorers",
  'usage': ".laliga <upcoming|matches|standings|scorers>",
  async 'execute'(v269, v270, v271, v272) {
    await leagueHandler(v269, v270, v271, v272, "🇪🇸 La Liga", {
      'upcoming': {
        'endpoint': "/laliga/upcomingmatches",
        'format': fmtMatches,
        'title': "Upcoming Matches"
      },
      'matches': {
        'endpoint': "/laliga/matches",
        'format': fmtMatches,
        'title': "Matches"
      },
      'standings': {
        'endpoint': "/laliga/standings",
        'format': fmtStandings,
        'title': "Standings"
      },
      'scorers': {
        'endpoint': "/laliga/scorers",
        'format': fmtScorers,
        'title': "Top Scorers"
      }
    });
  }
}, {
  'name': "ligue1",
  'aliases': ['ligue', "frenchleague"],
  'category': "sports",
  'description': "Ligue 1 — upcoming, matches, standings, scorers",
  'usage': ".ligue1 <upcoming|matches|standings|scorers>",
  async 'execute'(v273, v274, v275, v276) {
    await leagueHandler(v273, v274, v275, v276, "🇫🇷 Ligue 1", {
      'upcoming': {
        'endpoint': "/ligue1/upcomingmatches",
        'format': fmtMatches,
        'title': "Upcoming Matches"
      },
      'matches': {
        'endpoint': "/ligue1/matches",
        'format': fmtMatches,
        'title': 'Matches'
      },
      'standings': {
        'endpoint': "/ligue1/standings",
        'format': fmtStandings,
        'title': "Standings"
      },
      'scorers': {
        'endpoint': "/ligue1/scorers",
        'format': fmtScorers,
        'title': "Top Scorers"
      }
    });
  }
}, {
  'name': "seriea",
  'aliases': ['seria', "italianleague"],
  'category': "sports",
  'description': "Serie A — upcoming, matches, standings, scorers",
  'usage': ".seriea <upcoming|matches|standings|scorers>",
  async 'execute'(v277, v278, v279, v280) {
    await leagueHandler(v277, v278, v279, v280, "🇮🇹 Serie A", {
      'upcoming': {
        'endpoint': "/seriea/upcomingmatches",
        'format': fmtMatches,
        'title': "Upcoming Matches"
      },
      'matches': {
        'endpoint': "/seriea/matches",
        'format': fmtMatches,
        'title': "Matches"
      },
      'standings': {
        'endpoint': "/seriea/standings",
        'format': fmtStandings,
        'title': "Standings"
      },
      'scorers': {
        'endpoint': "/seriea/scorers",
        'format': fmtScorers,
        'title': "Top Scorers"
      }
    });
  }
}, {
  'name': "ucl",
  'aliases': ['championsleague', 'cl'],
  'category': 'sports',
  'description': "UCL Champions League — upcoming, matches, standings, scorers",
  'usage': ".ucl <upcoming|matches|standings|scorers>",
  async 'execute'(v281, v282, v283, v284) {
    await leagueHandler(v281, v282, v283, v284, "🏆 UCL Champions League", {
      'upcoming': {
        'endpoint': "/ucl/upcomingmatches",
        'format': fmtMatches,
        'title': "Upcoming Matches"
      },
      'matches': {
        'endpoint': '/ucl/matches',
        'format': fmtMatches,
        'title': "Matches"
      },
      'standings': {
        'endpoint': "/ucl/standings",
        'format': fmtStandings,
        'title': "Standings"
      },
      'scorers': {
        'endpoint': '/ucl/scorers',
        'format': fmtScorers,
        'title': "Top Scorers"
      }
    });
  }
}, {
  'name': "bet",
  'aliases': ["surebets", "bettips", 'betodds'],
  'category': "sports",
  'description': "Get sure bet tips and free odds",
  'usage': ".bet",
  async 'execute'(v285, v286, v287, v288) {
    await v285.sendMessage(v286.key.remoteJid, {
      'react': {
        'text': '⏳',
        'key': v286.key
      }
    });
    try {
      const v289 = await keithApi("/bet");
      await sendLong(v285, v286, "┏━━『 🎰 Sure Bet Tips & Free Odds 』━━", fmtBet(v289));
      await v285.sendMessage(v286.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v286.key
        }
      });
    } catch (v290) {
      await v285.sendMessage(v286.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v286.key
        }
      });
      v288.reply("❌ Failed: " + v290.message);
    }
  }
}, {
  'name': "footballnews",
  'aliases': ["fnews", "sportnews"],
  'category': "sports",
  'description': "Get latest football news",
  'usage': '.footballnews',
  async 'execute'(v291, v292, v293, v294) {
    await v291.sendMessage(v292.key.remoteJid, {
      'react': {
        'text': '⏳',
        'key': v292.key
      }
    });
    try {
      const v295 = await keithApi('/football/news');
      await sendLong(v291, v292, "┏━━『 📰 Football News 』━━", fmtNews(v295));
      await v291.sendMessage(v292.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v292.key
        }
      });
    } catch (v296) {
      await v291.sendMessage(v292.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v292.key
        }
      });
      v294.reply("❌ Failed: " + v296.message);
    }
  }
}];
