/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for demo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "demo.js",
  family: "B",
  command: "demo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "demo",
  aliases: [],
  category: "restored",
  description: "Restored: demo",
  usage: ".demo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
