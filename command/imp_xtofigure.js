/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tofigure.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tofigure.js",
  family: "B",
  command: "xtofigure",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xtofigure",
  aliases: [],
  category: "restored",
  description: "Restored: tofigure",
  usage: ".xtofigure",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
