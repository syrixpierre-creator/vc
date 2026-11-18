/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-cektt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-cektt.js",
  family: "A",
  command: "funcektt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funcektt",
  aliases: [],
  category: "restored",
  description: "Restored: fun-cektt",
  usage: ".funcektt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
