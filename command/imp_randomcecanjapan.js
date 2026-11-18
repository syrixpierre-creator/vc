/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-cecanjapan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-cecanjapan.js",
  family: "A",
  command: "randomcecanjapan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randomcecanjapan",
  aliases: [],
  category: "restored",
  description: "Restored: random-cecanjapan",
  usage: ".randomcecanjapan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
