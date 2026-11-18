/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for broadcast.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "broadcast.js",
  family: "A",
  command: 'broadcastalt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "broadcast",
  aliases: [],
  category: "restored",
  description: "Restored: broadcast",
  usage: ".broadcast",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
