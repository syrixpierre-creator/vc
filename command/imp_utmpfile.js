/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-tmpfile.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-tmpfile.js",
  family: "B",
  command: "utmpfile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "utmpfile",
  aliases: [],
  category: "restored",
  description: "Restored: u-tmpfile",
  usage: ".utmpfile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
