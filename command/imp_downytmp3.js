/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-ytmp3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-ytmp3.js",
  family: "B",
  command: "downytmp3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downytmp3",
  aliases: [],
  category: "restored",
  description: "Restored: down-ytmp3",
  usage: ".downytmp3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
