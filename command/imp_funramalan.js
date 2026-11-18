/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-ramalan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-ramalan.js",
  family: "A",
  command: "funramalan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funramalan",
  aliases: [],
  category: "restored",
  description: "Restored: fun-ramalan",
  usage: ".funramalan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
