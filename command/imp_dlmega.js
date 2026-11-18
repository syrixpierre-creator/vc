/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-mega.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-mega.js",
  family: "B",
  command: "dlmega",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlmega",
  aliases: [],
  category: "restored",
  description: "Restored: dl-mega",
  usage: ".dlmega",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
