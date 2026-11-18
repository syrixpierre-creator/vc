/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_ptv.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_ptv.js",
  family: "A",
  command: "newptv",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newptv",
  aliases: [],
  category: "restored",
  description: "Restored: new_ptv",
  usage: ".newptv",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
