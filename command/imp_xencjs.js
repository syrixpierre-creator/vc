/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for encjs.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "encjs.js",
  family: "B",
  command: "xencjs",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xencjs",
  aliases: [],
  category: "restored",
  description: "Restored: encjs",
  usage: ".xencjs",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
