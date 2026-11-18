/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-setbio.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-setbio.js",
  family: "B",
  command: "ownersetbio",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownersetbio",
  aliases: [],
  category: "restored",
  description: "Restored: owner-setbio",
  usage: ".ownersetbio",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
