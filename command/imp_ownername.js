/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ownername.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ownername.js",
  family: "B",
  command: "ownername",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownername",
  aliases: [],
  category: "restored",
  description: "Restored: ownername",
  usage: ".ownername",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
