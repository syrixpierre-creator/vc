/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_listreplies.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_listreplies.js",
  family: "A",
  command: "newlistreplies",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newlistreplies",
  aliases: [],
  category: "restored",
  description: "Restored: new_listreplies",
  usage: ".newlistreplies",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
