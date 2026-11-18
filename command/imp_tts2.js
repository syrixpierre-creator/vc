/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tts2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tts2.js",
  family: "B",
  command: "tts2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tts2",
  aliases: [],
  category: "restored",
  description: "Restored: tts2",
  usage: ".tts2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
