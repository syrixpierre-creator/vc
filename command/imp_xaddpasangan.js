/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for addpasangan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "addpasangan.js",
  family: "B",
  command: "xaddpasangan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xaddpasangan",
  aliases: [],
  category: "restored",
  description: "Restored: addpasangan",
  usage: ".xaddpasangan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
