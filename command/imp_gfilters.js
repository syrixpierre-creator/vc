/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gfilters.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gfilters.js",
  family: "B",
  command: "gfilters",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gfilters",
  aliases: [],
  category: "restored",
  description: "Restored: gfilters",
  usage: ".gfilters",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
