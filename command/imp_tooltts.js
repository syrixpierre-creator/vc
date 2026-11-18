/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-tts.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-tts.js",
  family: "B",
  command: "tooltts",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tooltts",
  aliases: [],
  category: "restored",
  description: "Restored: tool-tts",
  usage: ".tooltts",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
