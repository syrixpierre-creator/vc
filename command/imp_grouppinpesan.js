/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-pinpesan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-pinpesan.js",
  family: "A",
  command: "grouppinpesan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouppinpesan",
  aliases: [],
  category: "restored",
  description: "Restored: group-pinpesan",
  usage: ".grouppinpesan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
