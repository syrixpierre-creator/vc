/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ttsai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ttsai.js",
  family: "A",
  command: "xttsai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xttsai",
  aliases: [],
  category: "restored",
  description: "Restored: ttsai",
  usage: ".xttsai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
