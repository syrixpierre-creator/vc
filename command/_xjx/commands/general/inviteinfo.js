const config = require('../../config');
const {
  jidUser,
  resolvePhone,
  rememberLidMapping
} = require('../../utils/jidHelper');
function extractInviteCode(v1) {
  if (!v1) {
    return null;
  }
  const v2 = String(v1).trim();
  const v3 = v2.match(/chat\.whatsapp\.com\/(?:invite\/)?([A-Za-z0-9_-]{10,})/i);
  if (v3) {
    return v3[1];
  }
  if (/^[A-Za-z0-9_-]{10,}$/.test(v2)) {
    return v2;
  }
  return null;
}
function getQuotedText(v4) {
  const v5 = v4.message?.["extendedTextMessage"]?.["contextInfo"];
  const v6 = v5?.["quotedMessage"];
  if (!v6) {
    return '';
  }
  return v6.conversation || v6.extendedTextMessage?.["text"] || v6.imageMessage?.["caption"] || v6.videoMessage?.["caption"] || '';
}
function formatWhen(v7, v8) {
  if (!v7) {
    return "Unknown";
  }
  try {
    return new Date(v7 * 1000).toLocaleString("en-GB", {
      'timeZone': v8 || "UTC",
      'day': "2-digit",
      'month': "short",
      'year': "numeric",
      'hour': "2-digit",
      'minute': "2-digit"
    });
  } catch (v9) {
    return new Date(v7 * 1000).toISOString();
  }
}
function displayId(v10) {
  if (!v10) {
    return "Unknown";
  }
  return jidUser(v10) || String(v10).split('@')[0];
}
async function preferPn(v11, v12, v13) {
  if (v13) {
    return v13;
  }
  if (!v12) {
    return null;
  }
  if (!String(v12).endsWith("@lid")) {
    return v12;
  }
  const v14 = await resolvePhone(v11, v12);
  if (v14) {
    rememberLidMapping(v12, v14);
    return v14.includes('@') ? v14 : v14 + "@s.whatsapp.net";
  }
  return v12;
}
module.exports = {
  'name': 'inviteinfo',
  'aliases': ["inspect", "gclinkinfo", "linkinfo"],
  'category': "general",
  'description': "Preview a group from its invite link without joining",
  'usage': ".inviteinfo https://chat.whatsapp.com/XXXX",
  async 'execute'(v15, v16, v17, v18) {
    const v19 = [(v17 || []).join(" "), getQuotedText(v16)].filter(Boolean).join(" ");
    const v20 = extractInviteCode(v19);
    if (!v20) {
      return v18.reply("🔎 *Invite Info*\n\nUsage: .inviteinfo https://chat.whatsapp.com/XXXX\nOr reply to a message that contains the link.\n\n_Does not join the group._");
    }
    try {
      if (v18.react) {
        await v18.react('🔎')["catch"](() => {});
      }
      const v21 = await v15.groupGetInviteInfo(v20);
      const v22 = config.timezone || "Africa/Lagos";
      const v23 = await preferPn(v15, v21.owner, v21.ownerPn);
      const v24 = await preferPn(v15, v21.subjectOwner, v21.subjectOwnerPn);
      const v25 = ["┏━━『 INVITE INFO 』━━", '', "➥ Name      ➜ " + (v21.subject || "Unknown"), "➥ ID        ➜ " + (v21.id || "Unknown"), "➥ Members   ➜ " + (v21.size ?? (v21.participants || []).length), "➥ Created   ➜ " + formatWhen(v21.creation, v22), "➥ Owner     ➜ " + (v23 ? '@' + displayId(v23) : "Unknown")];
      if (v24) {
        v25.push("➥ Named by  ➜ @" + displayId(v24));
      }
      v25.push("➥ Announce  ➜ " + (v21.announce ? "admins only" : "everyone"));
      v25.push("➥ Locked    ➜ " + (v21.restrict ? "admins change info" : "anyone can change"));
      v25.push("➥ Join ask  ➜ " + (v21.joinApprovalMode ? "approval required" : 'open'));
      v25.push("➥ Add mode  ➜ " + (v21.memberAddMode ? "any member" : "admins only"));
      if (v21.isCommunity) {
        v25.push("➥ Type      ➜ community");
      }
      if (v21.linkedParent) {
        v25.push("➥ Parent    ➜ " + v21.linkedParent);
      }
      if (v21.ephemeralDuration) {
        const v26 = Math.round(v21.ephemeralDuration / 3600);
        v25.push("➥ Disappear ➜ " + v26 + 'h');
      }
      if (v21.desc) {
        const v27 = String(v21.desc).trim();
        v25.push('');
        v25.push("┃ Description");
        v25.push(v27.length > 400 ? v27.slice(0, 400) + '…' : v27);
      }
      v25.push('');
      v25.push("➥ Link      ➜ https://chat.whatsapp.com/" + v20);
      v25.push('');
      v25.push("┗━━━━━━━━━━━━━━━━");
      const v28 = [v23, v24].filter(Boolean);
      await v15.sendMessage(v18.from, {
        'text': v25.join("\n"),
        'mentions': v28
      }, {
        'quoted': v16
      });
      if (v18.react) {
        await v18.react('✅')["catch"](() => {});
      }
    } catch (v29) {
      console.error("[inviteinfo]", v29.message);
      if (v18.react) {
        await v18.react('❌')["catch"](() => {});
      }
      const v30 = /404|not-found|gone|invalid|item-not-found/i.test(v29.message || '');
      await v18.reply(v30 ? "❌ That invite link is invalid or has been reset." : "❌ Could not read invite: " + v29.message);
    }
  }
};
