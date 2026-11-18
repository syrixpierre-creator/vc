/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for addai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "addai.js",
  family: "A",
  command: "xaddai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xaddai",
  aliases: [],
  category: "restored",
  description: "Restored: addai",
  usage: ".xaddai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
