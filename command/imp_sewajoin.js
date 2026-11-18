/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sewa-join.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sewa-join.js",
  family: "B",
  command: "sewajoin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "sewajoin",
  aliases: [],
  category: "restored",
  description: "Restored: sewa-join",
  usage: ".sewajoin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
