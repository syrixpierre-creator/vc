/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-facebook.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-facebook.js",
  family: "B",
  command: "downfacebook",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downfacebook",
  aliases: [],
  category: "restored",
  description: "Restored: down-facebook",
  usage: ".downfacebook",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
