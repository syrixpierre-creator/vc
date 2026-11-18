/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-banchat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-banchat.js",
  family: "B",
  command: "ownerbanchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerbanchat",
  aliases: [],
  category: "restored",
  description: "Restored: owner-banchat",
  usage: ".ownerbanchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
