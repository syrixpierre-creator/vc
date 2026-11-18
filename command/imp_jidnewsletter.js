/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for jidnewsletter.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "jidnewsletter.js",
  family: "B",
  command: "jidnewsletter",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "jidnewsletter",
  aliases: [],
  category: "restored",
  description: "Restored: jidnewsletter",
  usage: ".jidnewsletter",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
