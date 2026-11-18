/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for blockwa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "blockwa.js",
  family: "A",
  command: "blockwa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "blockwa",
  aliases: [],
  category: "restored",
  description: "Restored: blockwa",
  usage: ".blockwa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
