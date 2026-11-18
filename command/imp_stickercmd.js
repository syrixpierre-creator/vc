/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stickercmd.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stickercmd.js",
  family: "B",
  command: "stickercmd",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickercmd",
  aliases: [],
  category: "restored",
  description: "Restored: stickercmd",
  usage: ".stickercmd",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
