/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_siminfo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_siminfo.js",
  family: "A",
  command: "newsiminfo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newsiminfo",
  aliases: [],
  category: "restored",
  description: "Restored: new_siminfo",
  usage: ".newsiminfo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
