/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for wa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "wa.js",
  family: "A",
  command: "wa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "wa",
  aliases: [],
  category: "restored",
  description: "Restored: wa",
  usage: ".wa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
