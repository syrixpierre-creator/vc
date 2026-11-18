/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner.js",
  family: "A",
  command: 'owneralt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "owner",
  aliases: [],
  category: "restored",
  description: "Restored: owner",
  usage: ".owner",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
