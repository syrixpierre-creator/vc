/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-antara.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-antara.js",
  family: "A",
  command: "internetantara",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetantara",
  aliases: [],
  category: "restored",
  description: "Restored: internet-antara",
  usage: ".internetantara",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
