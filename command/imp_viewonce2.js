/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for viewonce2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "viewonce2.js",
  family: "B",
  command: "viewonce2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "viewonce2",
  aliases: [],
  category: "restored",
  description: "Restored: viewonce2",
  usage: ".viewonce2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
