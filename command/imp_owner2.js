/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner2.js",
  family: "B",
  command: "owner2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "owner2",
  aliases: [],
  category: "restored",
  description: "Restored: owner2",
  usage: ".owner2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
