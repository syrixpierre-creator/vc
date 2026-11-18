/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for jadian-terima.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "jadian-terima.js",
  family: "A",
  command: "jadianterima",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "jadianterima",
  aliases: [],
  category: "restored",
  description: "Restored: jadian-terima",
  usage: ".jadianterima",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
