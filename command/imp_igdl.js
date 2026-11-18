/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for igdl.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "igdl.js",
  family: "B",
  command: "igdl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "igdl",
  aliases: [],
  category: "restored",
  description: "Restored: igdl",
  usage: ".igdl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
