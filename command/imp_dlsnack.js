/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-snack.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-snack.js",
  family: "B",
  command: "dlsnack",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlsnack",
  aliases: [],
  category: "restored",
  description: "Restored: dl-snack",
  usage: ".dlsnack",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
