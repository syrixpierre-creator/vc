/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for insult x.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "insult x.js",
  family: "B",
  command: "insultx",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "insultx",
  aliases: [],
  category: "restored",
  description: "Restored: insult x",
  usage: ".insultx",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
