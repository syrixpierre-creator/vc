/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_light.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_light.js",
  family: "A",
  command: "newlight",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newlight",
  aliases: [],
  category: "restored",
  description: "Restored: new_light",
  usage: ".newlight",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
