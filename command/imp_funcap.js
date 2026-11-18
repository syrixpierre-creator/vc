/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-cap.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-cap.js",
  family: "B",
  command: "funcap",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funcap",
  aliases: [],
  category: "restored",
  description: "Restored: fun-cap",
  usage: ".funcap",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
