/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for blackpink.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "blackpink.js",
  family: "B",
  command: "blackpink",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "blackpink",
  aliases: [],
  category: "restored",
  description: "Restored: blackpink",
  usage: ".blackpink",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
