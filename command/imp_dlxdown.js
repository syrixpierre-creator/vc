/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-xdown.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-xdown.js",
  family: "B",
  command: "dlxdown",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlxdown",
  aliases: [],
  category: "restored",
  description: "Restored: dl-xdown",
  usage: ".dlxdown",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
