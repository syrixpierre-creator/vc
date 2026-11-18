/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_snow.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_snow.js",
  family: "A",
  command: "newsnow",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newsnow",
  aliases: [],
  category: "restored",
  description: "Restored: new_snow",
  usage: ".newsnow",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
