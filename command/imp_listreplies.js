/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for listreplies.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "listreplies.js",
  family: "B",
  command: "listreplies",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "listreplies",
  aliases: [],
  category: "restored",
  description: "Restored: listreplies",
  usage: ".listreplies",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
