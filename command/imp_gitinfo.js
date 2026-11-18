/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gitinfo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gitinfo.js",
  family: "A",
  command: "gitinfo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gitinfo",
  aliases: [],
  category: "restored",
  description: "Restored: gitinfo",
  usage: ".gitinfo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
