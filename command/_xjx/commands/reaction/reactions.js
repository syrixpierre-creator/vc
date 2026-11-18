const axios = require("axios");
const NEKOS_ENDPOINTS = new Set(["hug", 'kiss', 'pat', "slap", "cry", "wave", "poke", "cuddle", "smile", "laugh", "dance", "happy", "wink", 'blush', "bite", "bored", "facepalm", "feed", 'handhold', "highfive", "kick", 'kill', 'punch', "shoot", "shrug", "sleep", "stare", "tickle", "yeet", "nom", "bonk", "glomp", 'angry', "nod", "run", "smug"]);
const NEKOS_NAME_MAP = {
  'thinking': "think",
  'kick3': "kick"
};
const fetchReactionImage = async ({
  sock: v1,
  msg: v2,
  extra: v3,
  command: v4
}) => {
  const v5 = v3.from || v2.key.remoteJid;
  try {
    let v6 = null;
    const v7 = NEKOS_NAME_MAP[v4] || v4;
    if (NEKOS_ENDPOINTS.has(v7)) {
      try {
        const {
          data: v8
        } = await axios.get("https://nekos.best/api/v2/" + v7, {
          'timeout': 0x3a98
        });
        v6 = v8?.["results"]?.[0]?.["url"] || null;
      } catch (v9) {}
    }
    if (!v6) {
      try {
        const {
          data: v10
        } = await axios.get("https://api.waifu.pics/sfw/" + v4, {
          'timeout': 0x3a98
        });
        v6 = v10?.['url'] || null;
      } catch (v11) {}
    }
    if (!v6) {
      throw new Error("No image URL returned from any source");
    }
    const v12 = await axios.get(v6, {
      'responseType': "arraybuffer",
      'timeout': 0x4e20
    });
    const v13 = Buffer.from(v12.data);
    const v14 = v4.replace(/[0-9]/g, '').replace(/_/g, " ");
    await v1.sendMessage(v5, {
      'image': v13,
      'caption': '_' + (v14.charAt(0).toUpperCase() + v14.slice(1)) + '_'
    }, {
      'quoted': v2
    });
  } catch (v15) {
    await v3.reply(global.mess?.["error"] || "❌ Failed to fetch reaction image.");
  }
};
module.exports = [{
  'command': ["kiss", 'cium', "beso"],
  'name': "kiss",
  'category': "reaction",
  'description': "Send a kiss reaction GIF",
  'usage': '.kiss',
  'execute': async (v16, v17, v18, v19) => {
    await fetchReactionImage({
      'sock': v16,
      'msg': v17,
      'extra': v19,
      'command': "kiss"
    });
  }
}, {
  'command': ["cry"],
  'name': "cry",
  'category': "reaction",
  'description': "Send a cry reaction GIF",
  'usage': ".cry",
  'execute': async (v20, v21, v22, v23) => {
    await fetchReactionImage({
      'sock': v20,
      'msg': v21,
      'extra': v23,
      'command': "cry"
    });
  }
}, {
  'command': ["blush"],
  'name': "blush",
  'category': "reaction",
  'description': "Send a blush reaction GIF",
  'usage': '.blush',
  'execute': async (v24, v25, v26, v27) => {
    await fetchReactionImage({
      'sock': v24,
      'msg': v25,
      'extra': v27,
      'command': "blush"
    });
  }
}, {
  'command': ["dance"],
  'name': "dance",
  'category': "reaction",
  'description': "Send a dance reaction GIF",
  'usage': '.dance',
  'execute': async (v28, v29, v30, v31) => {
    await fetchReactionImage({
      'sock': v28,
      'msg': v29,
      'extra': v31,
      'command': "dance"
    });
  }
}, {
  'command': ["kill"],
  'name': "kill",
  'category': 'reaction',
  'description': "Send a kill reaction GIF",
  'usage': '.kill',
  'execute': async (v32, v33, v34, v35) => {
    await fetchReactionImage({
      'sock': v32,
      'msg': v33,
      'extra': v35,
      'command': 'kill'
    });
  }
}, {
  'command': ["hug"],
  'name': "hug",
  'category': "reaction",
  'description': "Send a hug reaction GIF",
  'usage': ".hug",
  'execute': async (v36, v37, v38, v39) => {
    await fetchReactionImage({
      'sock': v36,
      'msg': v37,
      'extra': v39,
      'command': "hug"
    });
  }
}, {
  'command': ['kick', "kick3"],
  'name': 'kick',
  'category': "reaction",
  'description': "Send a kick reaction GIF",
  'usage': '.kick',
  'execute': async (v40, v41, v42, v43) => {
    await fetchReactionImage({
      'sock': v40,
      'msg': v41,
      'extra': v43,
      'command': "kick"
    });
  }
}, {
  'command': ["slap"],
  'name': "slap",
  'category': "reaction",
  'description': "Send a slap reaction GIF",
  'usage': ".slap",
  'execute': async (v44, v45, v46, v47) => {
    await fetchReactionImage({
      'sock': v44,
      'msg': v45,
      'extra': v47,
      'command': 'slap'
    });
  }
}, {
  'command': ['happy'],
  'name': "happy",
  'category': "reaction",
  'description': "Send a happy reaction GIF",
  'usage': ".happy",
  'execute': async (v48, v49, v50, v51) => {
    await fetchReactionImage({
      'sock': v48,
      'msg': v49,
      'extra': v51,
      'command': "happy"
    });
  }
}, {
  'command': ["bully"],
  'name': "bully",
  'category': "reaction",
  'description': "Send a bully reaction GIF",
  'usage': ".bully",
  'execute': async (v52, v53, v54, v55) => {
    await fetchReactionImage({
      'sock': v52,
      'msg': v53,
      'extra': v55,
      'command': "bully"
    });
  }
}, {
  'command': ["pat", "headpat"],
  'name': "pat",
  'category': 'reaction',
  'description': "Send a head pat reaction GIF",
  'usage': ".pat",
  'execute': async (v56, v57, v58, v59) => {
    await fetchReactionImage({
      'sock': v56,
      'msg': v57,
      'extra': v59,
      'command': "pat"
    });
  }
}, {
  'command': ["wink"],
  'name': "wink",
  'category': "reaction",
  'description': "Send a wink reaction GIF",
  'usage': '.wink',
  'execute': async (v60, v61, v62, v63) => {
    await fetchReactionImage({
      'sock': v60,
      'msg': v61,
      'extra': v63,
      'command': 'wink'
    });
  }
}, {
  'command': ["poke"],
  'name': "poke",
  'category': "reaction",
  'description': "Send a poke reaction GIF",
  'usage': '.poke',
  'execute': async (v64, v65, v66, v67) => {
    await fetchReactionImage({
      'sock': v64,
      'msg': v65,
      'extra': v67,
      'command': 'poke'
    });
  }
}, {
  'command': ["cuddle"],
  'name': 'cuddle',
  'category': "reaction",
  'description': "Send a cuddle reaction GIF",
  'usage': ".cuddle",
  'execute': async (v68, v69, v70, v71) => {
    await fetchReactionImage({
      'sock': v68,
      'msg': v69,
      'extra': v71,
      'command': "cuddle"
    });
  }
}, {
  'command': ["highfive", "hi5"],
  'name': 'highfive',
  'category': 'reaction',
  'description': "Send a high five reaction GIF",
  'usage': ".highfive",
  'execute': async (v72, v73, v74, v75) => {
    await fetchReactionImage({
      'sock': v72,
      'msg': v73,
      'extra': v75,
      'command': "highfive"
    });
  }
}, {
  'command': ["smile"],
  'name': 'smile',
  'category': "reaction",
  'description': "Send a smile reaction GIF",
  'usage': ".smile",
  'execute': async (v76, v77, v78, v79) => {
    await fetchReactionImage({
      'sock': v76,
      'msg': v77,
      'extra': v79,
      'command': 'smile'
    });
  }
}, {
  'command': ["wave"],
  'name': "wave",
  'category': "reaction",
  'description': "Send a wave reaction GIF",
  'usage': ".wave",
  'execute': async (v80, v81, v82, v83) => {
    await fetchReactionImage({
      'sock': v80,
      'msg': v81,
      'extra': v83,
      'command': 'wave'
    });
  }
}, {
  'command': ["bite"],
  'name': "bite",
  'category': "reaction",
  'description': "Send a bite reaction GIF",
  'usage': ".bite",
  'execute': async (v84, v85, v86, v87) => {
    await fetchReactionImage({
      'sock': v84,
      'msg': v85,
      'extra': v87,
      'command': "bite"
    });
  }
}, {
  'command': ["lick"],
  'name': 'lick',
  'category': 'reaction',
  'description': "Send a lick reaction GIF",
  'usage': ".lick",
  'execute': async (v88, v89, v90, v91) => {
    await fetchReactionImage({
      'sock': v88,
      'msg': v89,
      'extra': v91,
      'command': "lick"
    });
  }
}, {
  'command': ["bonk"],
  'name': "bonk",
  'category': "reaction",
  'description': "Send a bonk reaction GIF",
  'usage': '.bonk',
  'execute': async (v92, v93, v94, v95) => {
    await fetchReactionImage({
      'sock': v92,
      'msg': v93,
      'extra': v95,
      'command': "bonk"
    });
  }
}, {
  'command': ["yeet"],
  'name': "yeet",
  'category': "reaction",
  'description': "Send a yeet reaction GIF",
  'usage': ".yeet",
  'execute': async (v96, v97, v98, v99) => {
    await fetchReactionImage({
      'sock': v96,
      'msg': v97,
      'extra': v99,
      'command': "yeet"
    });
  }
}, {
  'command': ["glomp"],
  'name': "glomp",
  'category': "reaction",
  'description': "Send a glomp reaction GIF",
  'usage': ".glomp",
  'execute': async (v100, v101, v102, v103) => {
    await fetchReactionImage({
      'sock': v100,
      'msg': v101,
      'extra': v103,
      'command': "glomp"
    });
  }
}, {
  'command': ['stab'],
  'name': 'stab',
  'category': "reaction",
  'description': "Send a stab reaction GIF",
  'usage': ".stab",
  'execute': async (v104, v105, v106, v107) => {
    await fetchReactionImage({
      'sock': v104,
      'msg': v105,
      'extra': v107,
      'command': "stab"
    });
  }
}, {
  'command': ['nom'],
  'name': "nom",
  'category': "reaction",
  'description': "Send a nom reaction GIF",
  'usage': '.nom',
  'execute': async (v108, v109, v110, v111) => {
    await fetchReactionImage({
      'sock': v108,
      'msg': v109,
      'extra': v111,
      'command': 'nom'
    });
  }
}, {
  'command': ["tickle"],
  'name': "tickle",
  'category': "reaction",
  'description': "Send a tickle reaction GIF",
  'usage': ".tickle",
  'execute': async (v112, v113, v114, v115) => {
    await fetchReactionImage({
      'sock': v112,
      'msg': v113,
      'extra': v115,
      'command': "tickle"
    });
  }
}, {
  'command': ['throw'],
  'name': "throw",
  'category': "reaction",
  'description': "Send a throw reaction GIF",
  'usage': '.throw',
  'execute': async (v116, v117, v118, v119) => {
    await fetchReactionImage({
      'sock': v116,
      'msg': v117,
      'extra': v119,
      'command': "throw"
    });
  }
}, {
  'command': ["facepalm"],
  'name': "facepalm",
  'category': "reaction",
  'description': "Send a facepalm reaction GIF",
  'usage': '.facepalm',
  'execute': async (v120, v121, v122, v123) => {
    await fetchReactionImage({
      'sock': v120,
      'msg': v121,
      'extra': v123,
      'command': "facepalm"
    });
  }
}, {
  'command': ["feed"],
  'name': "feed",
  'category': "reaction",
  'description': "Send a feed reaction GIF",
  'usage': ".feed",
  'execute': async (v124, v125, v126, v127) => {
    await fetchReactionImage({
      'sock': v124,
      'msg': v125,
      'extra': v127,
      'command': "feed"
    });
  }
}, {
  'command': ['spank'],
  'name': "spank",
  'category': "reaction",
  'description': "Send a spank reaction GIF",
  'usage': ".spank",
  'execute': async (v128, v129, v130, v131) => {
    await fetchReactionImage({
      'sock': v128,
      'msg': v129,
      'extra': v131,
      'command': "spank"
    });
  }
}, {
  'command': ["handhold", "holdhands"],
  'name': "handhold",
  'category': "reaction",
  'description': "Send a handhold reaction GIF",
  'usage': '.handhold',
  'execute': async (v132, v133, v134, v135) => {
    await fetchReactionImage({
      'sock': v132,
      'msg': v133,
      'extra': v135,
      'command': 'handhold'
    });
  }
}, {
  'command': ["shoot"],
  'name': "shoot",
  'category': "reaction",
  'description': "Send a shoot reaction GIF",
  'usage': ".shoot",
  'execute': async (v136, v137, v138, v139) => {
    await fetchReactionImage({
      'sock': v136,
      'msg': v137,
      'extra': v139,
      'command': 'shoot'
    });
  }
}, {
  'command': ["punch"],
  'name': "punch",
  'category': "reaction",
  'description': "Send a punch reaction GIF",
  'usage': ".punch",
  'execute': async (v140, v141, v142, v143) => {
    await fetchReactionImage({
      'sock': v140,
      'msg': v141,
      'extra': v143,
      'command': "punch"
    });
  }
}, {
  'command': ["stare"],
  'name': 'stare',
  'category': "reaction",
  'description': "Send a stare reaction GIF",
  'usage': ".stare",
  'execute': async (v144, v145, v146, v147) => {
    await fetchReactionImage({
      'sock': v144,
      'msg': v145,
      'extra': v147,
      'command': "stare"
    });
  }
}, {
  'command': ["comfort"],
  'name': "comfort",
  'category': "reaction",
  'description': "Send a comfort reaction GIF",
  'usage': ".comfort",
  'execute': async (v148, v149, v150, v151) => {
    await fetchReactionImage({
      'sock': v148,
      'msg': v149,
      'extra': v151,
      'command': "comfort"
    });
  }
}, {
  'command': ['boop', "boopnose"],
  'name': 'boop',
  'category': "reaction",
  'description': "Send a boop reaction GIF",
  'usage': ".boop",
  'execute': async (v152, v153, v154, v155) => {
    await fetchReactionImage({
      'sock': v152,
      'msg': v153,
      'extra': v155,
      'command': 'boop'
    });
  }
}, {
  'command': ["sleep"],
  'name': "sleep",
  'category': "reaction",
  'description': "Send a sleep reaction GIF",
  'usage': ".sleep",
  'execute': async (v156, v157, v158, v159) => {
    await fetchReactionImage({
      'sock': v156,
      'msg': v157,
      'extra': v159,
      'command': "sleep"
    });
  }
}, {
  'command': ["shrug"],
  'name': 'shrug',
  'category': "reaction",
  'description': "Send a shrug reaction GIF",
  'usage': '.shrug',
  'execute': async (v160, v161, v162, v163) => {
    await fetchReactionImage({
      'sock': v160,
      'msg': v161,
      'extra': v163,
      'command': "shrug"
    });
  }
}, {
  'command': ["sip"],
  'name': "sip",
  'category': "reaction",
  'description': "Send a sip reaction GIF",
  'usage': ".sip",
  'execute': async (v164, v165, v166, v167) => {
    await fetchReactionImage({
      'sock': v164,
      'msg': v165,
      'extra': v167,
      'command': "sip"
    });
  }
}, {
  'command': ['clap'],
  'name': "clap",
  'category': "reaction",
  'description': "Send a clap reaction GIF",
  'usage': ".clap",
  'execute': async (v168, v169, v170, v171) => {
    await fetchReactionImage({
      'sock': v168,
      'msg': v169,
      'extra': v171,
      'command': "clap"
    });
  }
}, {
  'command': ["nervous"],
  'name': 'nervous',
  'category': 'reaction',
  'description': "Send a nervous reaction GIF",
  'usage': ".nervous",
  'execute': async (v172, v173, v174, v175) => {
    await fetchReactionImage({
      'sock': v172,
      'msg': v173,
      'extra': v175,
      'command': "nervous"
    });
  }
}, {
  'command': ["scream"],
  'name': 'scream',
  'category': 'reaction',
  'description': "Send a scream reaction GIF",
  'usage': '.scream',
  'execute': async (v176, v177, v178, v179) => {
    await fetchReactionImage({
      'sock': v176,
      'msg': v177,
      'extra': v179,
      'command': "scream"
    });
  }
}, {
  'command': ["pout"],
  'name': 'pout',
  'category': "reaction",
  'description': "Send a pout reaction GIF",
  'usage': '.pout',
  'execute': async (v180, v181, v182, v183) => {
    await fetchReactionImage({
      'sock': v180,
      'msg': v181,
      'extra': v183,
      'command': "pout"
    });
  }
}, {
  'command': ['bored'],
  'name': "bored",
  'category': 'reaction',
  'description': "Send a bored reaction GIF",
  'usage': '.bored',
  'execute': async (v184, v185, v186, v187) => {
    await fetchReactionImage({
      'sock': v184,
      'msg': v185,
      'extra': v187,
      'command': 'bored'
    });
  }
}, {
  'command': ['laugh'],
  'name': "laugh",
  'category': 'reaction',
  'description': "Send a laugh reaction GIF",
  'usage': '.laugh',
  'execute': async (v188, v189, v190, v191) => {
    await fetchReactionImage({
      'sock': v188,
      'msg': v189,
      'extra': v191,
      'command': "laugh"
    });
  }
}, {
  'command': ['shy'],
  'name': "shy",
  'category': "reaction",
  'description': "Send a shy reaction GIF",
  'usage': ".shy",
  'execute': async (v192, v193, v194, v195) => {
    await fetchReactionImage({
      'sock': v192,
      'msg': v193,
      'extra': v195,
      'command': "shy"
    });
  }
}, {
  'command': ['confused'],
  'name': "confused",
  'category': "reaction",
  'description': "Send a confused reaction GIF",
  'usage': ".confused",
  'execute': async (v196, v197, v198, v199) => {
    await fetchReactionImage({
      'sock': v196,
      'msg': v197,
      'extra': v199,
      'command': "confused"
    });
  }
}, {
  'command': ["angry"],
  'name': "angry",
  'category': "reaction",
  'description': "Send an angry reaction GIF",
  'usage': '.angry',
  'execute': async (v200, v201, v202, v203) => {
    await fetchReactionImage({
      'sock': v200,
      'msg': v201,
      'extra': v203,
      'command': 'angry'
    });
  }
}, {
  'command': ['excited'],
  'name': "excited",
  'category': "reaction",
  'description': "Send an excited reaction GIF",
  'usage': ".excited",
  'execute': async (v204, v205, v206, v207) => {
    await fetchReactionImage({
      'sock': v204,
      'msg': v205,
      'extra': v207,
      'command': "excited"
    });
  }
}, {
  'command': ["fear"],
  'name': 'fear',
  'category': "reaction",
  'description': "Send a fear reaction GIF",
  'usage': ".fear",
  'execute': async (v208, v209, v210, v211) => {
    await fetchReactionImage({
      'sock': v208,
      'msg': v209,
      'extra': v211,
      'command': "fear"
    });
  }
}, {
  'command': ['surprised'],
  'name': "surprised",
  'category': 'reaction',
  'description': "Send a surprised reaction GIF",
  'usage': ".surprised",
  'execute': async (v212, v213, v214, v215) => {
    await fetchReactionImage({
      'sock': v212,
      'msg': v213,
      'extra': v215,
      'command': "surprised"
    });
  }
}, {
  'command': ["thinking"],
  'name': "thinking",
  'category': "reaction",
  'description': "Send a thinking reaction GIF",
  'usage': ".thinking",
  'execute': async (v216, v217, v218, v219) => {
    await fetchReactionImage({
      'sock': v216,
      'msg': v217,
      'extra': v219,
      'command': "thinking"
    });
  }
}, {
  'command': ["embarrassed"],
  'name': "embarrassed",
  'category': 'reaction',
  'description': "Send an embarrassed reaction GIF",
  'usage': ".embarrassed",
  'execute': async (v220, v221, v222, v223) => {
    await fetchReactionImage({
      'sock': v220,
      'msg': v221,
      'extra': v223,
      'command': "embarrassed"
    });
  }
}, {
  'command': ['tired'],
  'name': 'tired',
  'category': "reaction",
  'description': "Send a tired reaction GIF",
  'usage': ".tired",
  'execute': async (v224, v225, v226, v227) => {
    await fetchReactionImage({
      'sock': v224,
      'msg': v225,
      'extra': v227,
      'command': "tired"
    });
  }
}, {
  'command': ["sad"],
  'name': "sad",
  'category': "reaction",
  'description': "Send a sad reaction GIF",
  'usage': ".sad",
  'execute': async (v228, v229, v230, v231) => {
    await fetchReactionImage({
      'sock': v228,
      'msg': v229,
      'extra': v231,
      'command': "sad"
    });
  }
}, {
  'command': ['love'],
  'name': 'love',
  'category': 'reaction',
  'description': "Send a love reaction GIF",
  'usage': ".love",
  'execute': async (v232, v233, v234, v235) => {
    await fetchReactionImage({
      'sock': v232,
      'msg': v233,
      'extra': v235,
      'command': "love"
    });
  }
}, {
  'command': ["peace"],
  'name': 'peace',
  'category': "reaction",
  'description': "Send a peace reaction GIF",
  'usage': ".peace",
  'execute': async (v236, v237, v238, v239) => {
    await fetchReactionImage({
      'sock': v236,
      'msg': v237,
      'extra': v239,
      'command': 'peace'
    });
  }
}, {
  'command': ["victory", "victorysign"],
  'name': "victory",
  'category': 'reaction',
  'description': "Send a victory reaction GIF",
  'usage': ".victory",
  'execute': async (v240, v241, v242, v243) => {
    await fetchReactionImage({
      'sock': v240,
      'msg': v241,
      'extra': v243,
      'command': "victory"
    });
  }
}, {
  'command': ['point'],
  'name': 'point',
  'category': "reaction",
  'description': "Send a point reaction GIF",
  'usage': ".point",
  'execute': async (v244, v245, v246, v247) => {
    await fetchReactionImage({
      'sock': v244,
      'msg': v245,
      'extra': v247,
      'command': 'point'
    });
  }
}];
