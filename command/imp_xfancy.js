/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fancy.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fancy.js",
  family: "B",
  command: "xfancy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xfancy",
  aliases: [],
  category: "restored",
  description: "Restored: fancy",
  usage: ".xfancy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
