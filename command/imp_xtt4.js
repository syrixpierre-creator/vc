/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tt4.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tt4.js",
  family: "B",
  command: "xtt4",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xtt4",
  aliases: [],
  category: "restored",
  description: "Restored: tt4",
  usage: ".xtt4",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
