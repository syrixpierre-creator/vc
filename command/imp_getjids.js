/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for getjids.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "getjids.js",
  family: "A",
  command: "getjids",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "getjids",
  aliases: [],
  category: "restored",
  description: "Restored: getjids",
  usage: ".getjids",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
