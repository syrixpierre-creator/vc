/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for msgch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "msgch.js",
  family: "B",
  command: "xmsgch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xmsgch",
  aliases: [],
  category: "restored",
  description: "Restored: msgch",
  usage: ".xmsgch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
