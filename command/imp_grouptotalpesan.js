/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-totalpesan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-totalpesan.js",
  family: "B",
  command: "grouptotalpesan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouptotalpesan",
  aliases: [],
  category: "restored",
  description: "Restored: group-totalpesan",
  usage: ".grouptotalpesan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
