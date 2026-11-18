const {
  jidDecode
} = require("@whiskeysockets/baileys");
const {
  jidUser,
  getLidMappingValue,
  rememberLidMapping,
  rememberParticipantLidMapping,
  resolvePhone
} = require("../../utils/jidHelper");
function isLidJid(v1) {
  try {
    const v2 = jidDecode(String(v1 || ''))?.["server"];
    return v2 === "lid" || v2 === "hosted.lid";
  } catch (v3) {
    return false;
  }
}
function isPnJid(v4) {
  try {
    const v5 = jidDecode(String(v4 || ''))?.["server"];
    return v5 === "s.whatsapp.net" || v5 === 'hosted' || v5 === 'c.us';
  } catch (v6) {
    return false;
  }
}
function asPnJid(v7) {
  const v8 = jidUser(v7);
  return v8 ? v8 + '@s.whatsapp.net' : null;
}
function asLidJid(v9) {
  const v10 = jidUser(v9);
  return v10 ? v10 + "@lid" : null;
}
function botUsers(v11) {
  const v12 = new Set();
  for (const v13 of [v11?.["user"]?.['id'], v11?.["user"]?.["lid"], v11?.['user']?.["phoneNumber"]]) {
    const v14 = jidUser(v13);
    if (v14) {
      v12.add(v14);
    }
  }
  return v12;
}
function isBotJid(v15, v16) {
  const v17 = jidUser(v16);
  return !!(v17 && botUsers(v15).has(v17));
}
function pairFromJid(v18) {
  if (!v18) {
    return {
      'lid': null,
      'pn': null
    };
  }
  return {
    'lid': isLidJid(v18) ? v18 : null,
    'pn': isPnJid(v18) ? v18 : null
  };
}
function collectInput(v19, v20, v21, v22) {
  const v23 = v19.message?.["extendedTextMessage"]?.["contextInfo"] || v19.message?.['imageMessage']?.["contextInfo"] || v19.message?.["videoMessage"]?.["contextInfo"] || null;
  const v24 = v23?.['mentionedJid']?.[0];
  if (v24) {
    return {
      'raw': v24,
      'lid': isLidJid(v24) ? v24 : null,
      'pn': isPnJid(v24) ? v24 : null,
      'hint': "mention"
    };
  }
  if (v23?.["quotedMessage"] && (v23.participant || v23.participantAlt)) {
    return {
      'raw': v23.participantAlt || v23.participant,
      'lid': isLidJid(v23.participant) ? v23.participant : isLidJid(v23.participantAlt) ? v23.participantAlt : null,
      'pn': isPnJid(v23.participantAlt) ? v23.participantAlt : isPnJid(v23.participant) ? v23.participant : null,
      'hint': "quoted"
    };
  }
  const v25 = (v20 || []).join(" ").trim();
  if (v25) {
    if (v25.includes("@lid") || v25.includes("@hosted.lid")) {
      return {
        'raw': v25,
        'lid': v25.includes('@') ? v25 : asLidJid(v25),
        'pn': null,
        'hint': "arg-lid"
      };
    }
    if (v25.includes("@s.whatsapp.net") || v25.includes("@hosted")) {
      return {
        'raw': v25,
        'lid': null,
        'pn': v25,
        'hint': 'arg-pn'
      };
    }
    const v26 = v25.replace(/\D/g, '');
    if (v26.length >= 14) {
      return {
        'raw': v25,
        'lid': v26 + '@lid',
        'pn': null,
        'hint': "arg-lid"
      };
    }
    if (v26.length >= 7 && v26.length <= 15) {
      return {
        'raw': v25,
        'lid': null,
        'pn': v26 + "@s.whatsapp.net",
        'hint': 'arg-pn'
      };
    }
    return {
      'raw': v25,
      'lid': null,
      'pn': null,
      'hint': "arg-unknown"
    };
  }
  const v27 = v21.isGroup ? [v19.key?.["participantAlt"], v19.key?.["participant"], v21.sender] : [v19.key?.["remoteJidAlt"], v21.from, v21.sender, v19.key?.["remoteJid"]];
  let v28 = null;
  for (const v29 of v27) {
    if (!v29) {
      continue;
    }
    if (String(v29).endsWith("@g.us")) {
      continue;
    }
    if (isBotJid(v22, v29)) {
      continue;
    }
    v28 = v29;
    break;
  }
  if (!v28) {
    return {
      'raw': null,
      'lid': null,
      'pn': null,
      'hint': "need-target"
    };
  }
  const v30 = pairFromJid(v28);
  return {
    'raw': v28,
    'lid': v30.lid,
    'pn': v30.pn,
    'hint': v21.isGroup ? "sender" : 'chat'
  };
}
function findParticipant(v31, v32) {
  if (!v31?.["participants"] || !v32) {
    return null;
  }
  const v33 = jidUser(v32);
  return v31.participants.find(v34 => {
    if (!v34 || typeof v34 === "string") {
      return false;
    }
    const v35 = [v34.id, v34.lid, v34.userJid, v34.phoneNumber, v34.pn].filter(Boolean);
    return v35.includes(v32) || v35.some(v36 => jidUser(v36) === v33);
  }) || null;
}
async function resolvePair(v37, v38, v39) {
  const v40 = v37.signalRepository?.['lidMapping'];
  let v41 = v39.lid || null;
  let v42 = v39.pn && isPnJid(v39.pn) ? v39.pn : v39.pn ? asPnJid(v39.pn) : null;
  const v43 = [];
  const v44 = findParticipant(v38.groupMetadata, v41 || v42 || v39.raw);
  if (v44) {
    rememberParticipantLidMapping(v44);
    if (!v41 && (v44.lid || isLidJid(v44.id))) {
      v41 = v44.lid || v44.id;
      v43.push("group");
    }
    if (!v42 && (v44.phoneNumber || v44.pn || isPnJid(v44.id))) {
      const v45 = v44.phoneNumber || v44.pn || v44.id;
      v42 = v45.includes('@') ? v45 : v45 + '@s.whatsapp.net';
      v43.push("group");
    }
  }
  if (v41 && !v42) {
    try {
      if (v40?.["getPNForLID"]) {
        const v46 = await v40.getPNForLID(v41);
        if (v46) {
          v42 = isPnJid(v46) ? v46 : asPnJid(v46);
          v43.push("baileys");
        }
      }
    } catch (v47) {}
    if (!v42) {
      const v48 = getLidMappingValue(jidUser(v41), "lidToPn");
      if (v48) {
        v42 = asPnJid(v48);
        v43.push("sqlite");
      }
    }
    if (!v42) {
      const v49 = await resolvePhone(v37, v41);
      if (v49) {
        v42 = asPnJid(v49);
        v43.push('helper');
      }
    }
  }
  if (v42 && !v41) {
    try {
      if (v40?.["getLIDForPN"]) {
        const v50 = await v40.getLIDForPN(v42);
        if (v50) {
          v41 = isLidJid(v50) ? v50 : asLidJid(v50);
          v43.push("baileys");
        }
      }
    } catch (v51) {}
    if (!v41) {
      try {
        if (v40?.["getLIDsForPNs"]) {
          const v52 = await v40.getLIDsForPNs([v42]);
          const v53 = Array.isArray(v52) ? v52[0] : null;
          const v54 = v53?.["lid"] || null;
          if (v54) {
            v41 = isLidJid(v54) ? v54 : asLidJid(v54);
            v43.push("baileys");
          }
        }
      } catch (v55) {}
    }
    if (!v41) {
      const v56 = getLidMappingValue(jidUser(v42), 'pnToLid');
      if (v56) {
        v41 = asLidJid(v56);
        v43.push("sqlite");
      }
    }
  }
  if (v41 && v42) {
    rememberLidMapping(v41, v42);
  }
  return {
    'lid': v41,
    'pn': v42,
    'sources': [...new Set(v43)]
  };
}
module.exports = {
  'name': "lid",
  'aliases': ["lidinfo", "pn2lid", "resolve"],
  'category': 'general',
  'description': "Resolve WhatsApp phone number ↔ LID",
  'usage': ".lid [@user | number | reply]",
  async 'execute'(v57, v58, v59, v60) {
    const v61 = collectInput(v58, v59, v60, v57);
    if (v61.hint === "need-target") {
      return v60.reply("🆔 *LID Resolver — No Target*\n\nProvide a target to resolve:\n\nUsage:\n  .lid @user\n  .lid 2348072642047\n  .lid 233256100331525@lid\n  reply + .lid");
    }
    if (v61.hint === 'arg-unknown') {
      return v60.reply("🆔 *LID Resolver*\n\n" + ("Could not parse: *" + v61.raw + "*\n\n") + "Usage:\n" + "  .lid @user\n" + "  .lid 2348072642047\n" + "  .lid 233256100331525@lid\n" + "  reply + .lid");
    }
    try {
      if (v60.react) {
        await v60.react('🆔')["catch"](() => {});
      }
      const v62 = await resolvePair(v57, v60, v61);
      const v63 = v62.sources.length ? v62.sources.join(" · ") : v61.hint || "none";
      const v64 = ["┏━━『 LID MAP 』━━", '', "➥ Target    ➜ " + v61.raw, "➥ Phone     ➜ " + (v62.pn || "not cached"), "➥ LID       ➜ " + (v62.lid || "not cached"), "➥ Source    ➜ " + v63, '', "┗━━━━━━━━━━━━━━━━"];
      if (!v62.pn && v62.lid) {
        v64.splice(v64.length - 2, 0, "_PN is only known after WhatsApp has seen this user._");
      }
      if (v60.react) {
        await v60.react(v62.pn || v62.lid ? '✅' : '⚠️')['catch'](() => {});
      }
      await v60.reply(v64.join("\n"));
    } catch (v65) {
      console.error("[lid]", v65.message);
      if (v60.react) {
        await v60.react('❌')["catch"](() => {});
      }
      await v60.reply("❌ LID lookup failed: " + v65.message);
    }
  }
};
