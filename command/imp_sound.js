/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sound.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sound.js",
  family: "B",
  command: "sound",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "sound",
  aliases: [],
  category: "restored",
  description: "Restored: sound",
  usage: ".sound",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
