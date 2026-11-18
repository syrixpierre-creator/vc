/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stickercrop.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stickercrop.js",
  family: "A",
  command: "stickercrop",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickercrop",
  aliases: [],
  category: "restored",
  description: "Restored: stickercrop",
  usage: ".stickercrop",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
