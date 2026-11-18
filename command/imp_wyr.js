/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for wyr.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "wyr.js",
  family: "A",
  command: "wyr",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "wyr",
  aliases: [],
  category: "restored",
  description: "Restored: wyr",
  usage: ".wyr",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
