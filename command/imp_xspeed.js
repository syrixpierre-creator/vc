/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for speed.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "speed.js",
  family: "B",
  command: "xspeed",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xspeed",
  aliases: [],
  category: "restored",
  description: "Restored: speed",
  usage: ".xspeed",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
