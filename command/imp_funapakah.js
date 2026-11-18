/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-apakah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-apakah.js",
  family: "A",
  command: "funapakah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funapakah",
  aliases: [],
  category: "restored",
  description: "Restored: fun-apakah",
  usage: ".funapakah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
