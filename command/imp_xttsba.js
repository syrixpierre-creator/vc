/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ttsba.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ttsba.js",
  family: "B",
  command: "xttsba",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xttsba",
  aliases: [],
  category: "restored",
  description: "Restored: ttsba",
  usage: ".xttsba",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
