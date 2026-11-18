/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for totalpesan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "totalpesan.js",
  family: "B",
  command: "xtotalpesan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xtotalpesan",
  aliases: [],
  category: "restored",
  description: "Restored: totalpesan",
  usage: ".xtotalpesan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
