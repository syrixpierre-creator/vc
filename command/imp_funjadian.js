/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-jadian.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-jadian.js",
  family: "B",
  command: "funjadian",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funjadian",
  aliases: [],
  category: "restored",
  description: "Restored: fun-jadian",
  usage: ".funjadian",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
