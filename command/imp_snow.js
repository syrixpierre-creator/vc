/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for snow.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "snow.js",
  family: "B",
  command: "snow",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "snow",
  aliases: [],
  category: "restored",
  description: "Restored: snow",
  usage: ".snow",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
