/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-gimg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-gimg.js",
  family: "B",
  command: "internetgimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetgimg",
  aliases: [],
  category: "restored",
  description: "Restored: internet-gimg",
  usage: ".internetgimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
