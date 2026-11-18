/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-kbbi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-kbbi.js",
  family: "A",
  command: "internetkbbi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetkbbi",
  aliases: [],
  category: "restored",
  description: "Restored: internet-kbbi",
  usage: ".internetkbbi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
