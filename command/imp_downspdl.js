/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-spdl.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-spdl.js",
  family: "B",
  command: "downspdl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downspdl",
  aliases: [],
  category: "restored",
  description: "Restored: down-spdl",
  usage: ".downspdl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
