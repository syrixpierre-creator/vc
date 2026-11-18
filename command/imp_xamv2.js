/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for amv2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "amv2.js",
  family: "B",
  command: "xamv2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xamv2",
  aliases: [],
  category: "restored",
  description: "Restored: amv2",
  usage: ".xamv2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
