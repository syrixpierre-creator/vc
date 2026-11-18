/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for hd2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "hd2.js",
  family: "B",
  command: "xhd2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xhd2",
  aliases: [],
  category: "restored",
  description: "Restored: hd2",
  usage: ".xhd2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
