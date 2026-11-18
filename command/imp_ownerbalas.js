/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-balas.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-balas.js",
  family: "B",
  command: "ownerbalas",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerbalas",
  aliases: [],
  category: "restored",
  description: "Restored: owner-balas",
  usage: ".ownerbalas",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
