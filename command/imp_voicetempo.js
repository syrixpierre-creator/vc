/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for voice-tempo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "voice-tempo.js",
  family: "A",
  command: "voicetempo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "voicetempo",
  aliases: [],
  category: "restored",
  description: "Restored: voice-tempo",
  usage: ".voicetempo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
