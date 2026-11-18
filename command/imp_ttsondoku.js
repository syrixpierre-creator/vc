/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tts-ondoku.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tts-ondoku.js",
  family: "A",
  command: "ttsondoku",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ttsondoku",
  aliases: [],
  category: "restored",
  description: "Restored: tts-ondoku",
  usage: ".ttsondoku",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
