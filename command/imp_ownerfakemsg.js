/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-fakemsg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-fakemsg.js",
  family: "B",
  command: "ownerfakemsg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerfakemsg",
  aliases: [],
  category: "restored",
  description: "Restored: owner-fakemsg",
  usage: ".ownerfakemsg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
