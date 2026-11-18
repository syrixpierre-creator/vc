/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-ppcp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-ppcp.js",
  family: "B",
  command: "internetppcp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetppcp",
  aliases: [],
  category: "restored",
  description: "Restored: internet-ppcp",
  usage: ".internetppcp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
