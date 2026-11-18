'use strict';

let giftedBtns;
try {
  giftedBtns = require("gifted-btns");
} catch (v1) {
  giftedBtns = null;
}
async function resolveJid(v2, v3, v4 = null) {
  if (!v3) {
    return v3;
  }
  if (/@(g\.us|newsletter|s\.whatsapp\.net)$/.test(v3)) {
    return v3;
  }
  if (v3.endsWith("@lid")) {
    if (v4?.["endsWith"]("@g.us")) {
      try {
        const v5 = (await v2.groupMetadata(v4)).participants?.["find"](v6 => v6.id === v3);
        if (v5?.["phoneNumber"]) {
          return resolveJid(v2, v5.phoneNumber);
        }
      } catch (v7) {}
    }
    try {
      const v8 = await v2.signalRepository?.["lidMapping"]?.["getPNForLID"]?.(v3);
      if (v8) {
        return resolveJid(v2, v8);
      }
    } catch (v9) {}
    const v10 = global.lidPhoneCache?.["get"](v3.split('@')[0]);
    return v10 ? v10 + "@s.whatsapp.net" : v3;
  }
  const v11 = v3.split('@')[0].split(':')[0].replace(/\D/g, '');
  return v11.length >= 7 ? v11 + "@s.whatsapp.net" : v3;
}
async function sendJid(v12, v13, v14) {
  const v15 = v13.key.remoteJid;
  const v16 = "*JID*\n`" + v14 + "`\n" + "⚡ *Engineered by June_Ultra*";
  if (giftedBtns?.['sendInteractiveMessage']) {
    try {
      return giftedBtns.sendInteractiveMessage(v12, v15, {
        'text': v16,
        'interactiveButtons': [{
          'name': "cta_copy",
          'buttonParamsJson': JSON.stringify({
            'display_text': "📋 Copy JID",
            'copy_code': v14
          })
        }]
      });
    } catch (v17) {}
  }
  return v12.sendMessage(v15, {
    'text': v16
  }, {
    'quoted': v13
  });
}
const command = {
  'name': "getjid",
  'aliases': ["jid", 'id'],
  'category': "utility",
  'description': "Get the JID of a chat, user, group or channel",
  async 'execute'(v18, v19, v20) {
    const v21 = v19.key.remoteJid;
    try {
      const v22 = v19.message?.["extendedTextMessage"]?.["contextInfo"];
      const v23 = v22?.["mentionedJid"]?.[0];
      const v24 = v22?.["participant"];
      let v25 = v21;
      if (v24 || v23) {
        v25 = await resolveJid(v18, v24 || v23, v21);
      } else {
        if (v20.length) {
          const v26 = v20.join(" ");
          const v27 = v26.match(/(?:whatsapp\.com\/channel|chat\.whatsapp\.com\/channel)\/([\w-]+)/i);
          const v28 = v26.match(/chat\.whatsapp\.com\/([\w-]+)/i);
          if (v27) {
            v25 = (await v18.newsletterMetadata("invite", v27[1])).id;
          } else {
            if (v28) {
              v25 = (await v18.groupGetInviteInfo(v28[1])).id;
            } else {
              v25 = await resolveJid(v18, v26, v21);
            }
          }
        } else {
          if (!v21.endsWith("@g.us")) {
            v25 = await resolveJid(v18, v19.key.participant || v21, v21);
          }
        }
      }
      return sendJid(v18, v19, v25);
    } catch (v29) {
      return v18.sendMessage(v21, {
        'text': "❌ " + v29.message
      }, {
        'quoted': v19
      });
    }
  },
  'resolveJid': resolveJid
};
module.exports = command;
module.exports.resolveJid = resolveJid;
