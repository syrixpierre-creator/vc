/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-sfile.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-sfile.js",
  family: "B",
  command: "downsfile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downsfile",
  aliases: [],
  category: "restored",
  description: "Restored: down-sfile",
  usage: ".downsfile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
