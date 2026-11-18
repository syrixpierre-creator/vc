/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-listgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-listgc.js",
  family: "B",
  command: "ownerlistgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerlistgc",
  aliases: [],
  category: "restored",
  description: "Restored: owner-listgc",
  usage: ".ownerlistgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
