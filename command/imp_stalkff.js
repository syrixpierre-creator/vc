/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stalk-ff.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stalk-ff.js",
  family: "B",
  command: "stalkff",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stalkff",
  aliases: [],
  category: "restored",
  description: "Restored: stalk-ff",
  usage: ".stalkff",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
