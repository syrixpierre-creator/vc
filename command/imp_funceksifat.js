/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-ceksifat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-ceksifat.js",
  family: "A",
  command: "funceksifat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funceksifat",
  aliases: [],
  category: "restored",
  description: "Restored: fun-ceksifat",
  usage: ".funceksifat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
