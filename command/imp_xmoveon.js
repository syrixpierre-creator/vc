/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for moveon.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "moveon.js",
  family: "A",
  command: "xmoveon",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xmoveon",
  aliases: [],
  category: "restored",
  description: "Restored: moveon",
  usage: ".xmoveon",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
