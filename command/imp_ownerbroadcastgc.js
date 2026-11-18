/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-broadcastgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-broadcastgc.js",
  family: "B",
  command: "ownerbroadcastgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerbroadcastgc",
  aliases: [],
  category: "restored",
  description: "Restored: owner-broadcastgc",
  usage: ".ownerbroadcastgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
