function getQuotedKey(v1, v2, v3) {
  const v4 = v2.message?.["extendedTextMessage"]?.["contextInfo"] || v2.message?.['imageMessage']?.['contextInfo'] || v2.message?.["videoMessage"]?.["contextInfo"] || v2.message?.["audioMessage"]?.["contextInfo"] || v2.message?.["documentMessage"]?.['contextInfo'] || v2.message?.['stickerMessage']?.["contextInfo"] || null;
  if (!v4?.['stanzaId']) {
    return null;
  }
  const v5 = v1.user?.['id']?.['split'](':')[0] || v1.user?.['id']?.['split']('@')[0];
  const v6 = v4.participant || '';
  const v7 = v6 ? v6.split('@')[0] === v5 : v2.key.fromMe;
  return {
    'id': v4.stanzaId,
    'remoteJid': v3,
    'fromMe': v7,
    'participant': v4.participant || undefined
  };
}
module.exports = [{
  'name': "pin",
  'aliases': ["pinchat"],
  'category': "utility",
  'description': "Pin the current chat",
  'usage': '.pin',
  async 'execute'(v8, v9, v10, v11) {
    const v12 = v11.from;
    await v8.sendMessage(v9.key.remoteJid, {
      'react': {
        'text': '📌',
        'key': v9.key
      }
    });
    try {
      await v8.chatModify({
        'pin': true
      }, v12);
      await v8.sendMessage(v9.key.remoteJid, {
        'text': "📌 *Chat Pinned*\n\nThis chat has been pinned successfully.\n\n_Use_ *.unpin* _to unpin this chat._"
      }, {
        'quoted': v9
      });
      await v8.sendMessage(v9.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v9.key
        }
      });
    } catch (v13) {
      console.error("[pin]", v13.message);
      await v8.sendMessage(v9.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v9.key
        }
      });
      const v14 = v13.message?.["includes"]("App state key not present") ? "❌ *Cannot pin chat* — your session does not have app state keys.\n\nChat pinning requires a full WhatsApp session (not just a SESSION_ID string). This is a Baileys limitation." : "❌ Failed to pin chat: " + v13.message;
      v11.reply(v14);
    }
  }
}, {
  'name': "unpin",
  'aliases': ["unpinchat"],
  'category': "utility",
  'description': "Unpin the current chat",
  'usage': ".unpin",
  async 'execute'(v15, v16, v17, v18) {
    const v19 = v18.from;
    await v15.sendMessage(v16.key.remoteJid, {
      'react': {
        'text': '📌',
        'key': v16.key
      }
    });
    try {
      await v15.chatModify({
        'pin': false
      }, v19);
      await v15.sendMessage(v16.key.remoteJid, {
        'text': "📌 *Chat Unpinned*\n\nThis chat has been unpinned successfully.\n\n_Use_ *.pin* _to pin this chat again._"
      }, {
        'quoted': v16
      });
      await v15.sendMessage(v16.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v16.key
        }
      });
    } catch (v20) {
      console.error("[unpin]", v20.message);
      await v15.sendMessage(v16.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v16.key
        }
      });
      const v21 = v20.message?.["includes"]("App state key not present") ? "❌ *Cannot unpin chat* — your session does not have app state keys.\n\nChat unpinning requires a full WhatsApp session (not just a SESSION_ID string). This is a Baileys limitation." : "❌ Failed to unpin chat: " + v20.message;
      v18.reply(v21);
    }
  }
}, {
  'name': "pinmsg",
  'aliases': ["pinmessage"],
  'category': "utility",
  'description': "Pin a quoted message in a chat or group",
  'usage': ".pinmsg [24h|7d|30d] (reply to a message)",
  async 'execute'(v22, v23, v24, v25) {
    const v26 = v25.from;
    const v27 = v24[0];
    const v28 = {
      '24h': 0x15180,
      '7d': 0x93a80,
      '30d': 0x278d00
    };
    const v29 = v28[v27] || 604800;
    const v30 = getQuotedKey(v22, v23, v26);
    if (!v30) {
      return v25.reply("❌ *Please reply to a message to pin it.*\n\n*Usage:* .pinmsg\n*Duration options:*\n  .pinmsg 24h  → Pin for 24 hours\n  .pinmsg 7d   → Pin for 7 days _(default)_\n  .pinmsg 30d  → Pin for 30 days");
    }
    await v22.sendMessage(v23.key.remoteJid, {
      'react': {
        'text': '📌',
        'key': v23.key
      }
    });
    try {
      await v22.sendMessage(v26, {
        'pin': v30,
        'type': 0x1,
        'time': v29
      });
      const v31 = v27 === "24h" ? "24 hours" : v27 === '30d' ? "30 days" : "7 days";
      await v22.sendMessage(v23.key.remoteJid, {
        'text': "📌 *Message Pinned*\n\n" + ("Duration: *" + v31 + "*\n\n") + "_Use_ *.unpinmsg* _(reply to the same message) to unpin._"
      }, {
        'quoted': v23
      });
      await v22.sendMessage(v23.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v23.key
        }
      });
    } catch (v32) {
      console.error('[pinmsg]', v32.message);
      await v22.sendMessage(v23.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v23.key
        }
      });
      v25.reply("❌ Failed to pin message. Make sure the bot is an admin in groups.");
    }
  }
}, {
  'name': "unpinmsg",
  'aliases': ["unpinmessage"],
  'category': "utility",
  'description': "Unpin a quoted message in a chat or group",
  'usage': ".unpinmsg (reply to the pinned message)",
  async 'execute'(v33, v34, v35, v36) {
    const v37 = v36.from;
    const v38 = getQuotedKey(v33, v34, v37);
    if (!v38) {
      return v36.reply("❌ *Please reply to the pinned message to unpin it.*\n\n*Usage:* .unpinmsg _(reply to the pinned message)_");
    }
    await v33.sendMessage(v34.key.remoteJid, {
      'react': {
        'text': '📌',
        'key': v34.key
      }
    });
    try {
      await v33.sendMessage(v37, {
        'pin': v38,
        'type': 0x2,
        'time': 0x0
      });
      await v33.sendMessage(v34.key.remoteJid, {
        'text': "📌 *Message Unpinned*\n\nThe message has been unpinned successfully.\n\n_Use_ *.pinmsg* _(reply to a message) to pin again._"
      }, {
        'quoted': v34
      });
      await v33.sendMessage(v34.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v34.key
        }
      });
    } catch (v39) {
      console.error("[unpinmsg]", v39.message);
      await v33.sendMessage(v34.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v34.key
        }
      });
      v36.reply("❌ Failed to unpin message. Make sure the bot is an admin in groups.");
    }
  }
}, {
  'name': "starmsg",
  'aliases': ['star', 'starmesg', "starmessage"],
  'category': "utility",
  'description': "Star or unstar a quoted message",
  'usage': ".starmsg (reply to a message) | .starmsg unstar (reply to unstar)",
  async 'execute'(v40, v41, v42, v43) {
    const v44 = v43.from;
    const v45 = v42[0]?.["toLowerCase"]() === 'unstar';
    const v46 = getQuotedKey(v40, v41, v44);
    if (!v46) {
      return v43.reply("❌ *Please reply to a message to star it.*\n\n*Usage:*\n  .starmsg            → ⭐ Star the quoted message\n  .starmsg unstar     → ✖ Unstar the quoted message");
    }
    await v40.sendMessage(v41.key.remoteJid, {
      'react': {
        'text': v45 ? '✖️' : '⭐',
        'key': v41.key
      }
    });
    try {
      await v40.star(v44, [{
        'id': v46.id,
        'fromMe': v46.fromMe
      }], !v45);
      if (v45) {
        await v40.sendMessage(v41.key.remoteJid, {
          'text': "✖️ *Message Unstarred*\n\nThe message has been removed from your starred messages.\n\n_Use_ *.starmsg* _(reply to a message) to star it again._"
        }, {
          'quoted': v41
        });
      } else {
        await v40.sendMessage(v41.key.remoteJid, {
          'text': "⭐ *Message Starred*\n\nThe message has been added to your starred messages.\n\n_Use_ *.starmsg unstar* _(reply to the message) to unstar._"
        }, {
          'quoted': v41
        });
      }
      await v40.sendMessage(v41.key.remoteJid, {
        'react': {
          'text': '✅',
          'key': v41.key
        }
      });
    } catch (v47) {
      console.error('[starmsg]', v47.message);
      await v40.sendMessage(v41.key.remoteJid, {
        'react': {
          'text': '❌',
          'key': v41.key
        }
      });
      v43.reply("❌ Failed to " + (v45 ? "unstar" : "star") + " message. Please try again.");
    }
  }
}];
