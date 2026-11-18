/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-playstore.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-playstore.js",
  family: "B",
  command: "internetplaystore",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetplaystore",
  aliases: [],
  category: "restored",
  description: "Restored: internet-playstore",
  usage: ".internetplaystore",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
