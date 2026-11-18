/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-bisakah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-bisakah.js",
  family: "B",
  command: "funbisakah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funbisakah",
  aliases: [],
  category: "restored",
  description: "Restored: fun-bisakah",
  usage: ".funbisakah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
