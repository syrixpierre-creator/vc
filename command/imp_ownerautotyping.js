/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-autotyping.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-autotyping.js",
  family: "B",
  command: "ownerautotyping",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerautotyping",
  aliases: [],
  category: "restored",
  description: "Restored: owner-autotyping",
  usage: ".ownerautotyping",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
