/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tourl3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tourl3.js",
  family: "B",
  command: "tourl3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tourl3",
  aliases: [],
  category: "restored",
  description: "Restored: tourl3",
  usage: ".tourl3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
