/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-tagall.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-tagall.js",
  family: "B",
  command: "ownertagall",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownertagall",
  aliases: [],
  category: "restored",
  description: "Restored: owner-tagall",
  usage: ".ownertagall",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
