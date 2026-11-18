/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-leavegc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-leavegc.js",
  family: "B",
  command: "ownerleavegc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerleavegc",
  aliases: [],
  category: "restored",
  description: "Restored: owner-leavegc",
  usage: ".ownerleavegc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
