/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_lastseen.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_lastseen.js",
  family: "A",
  command: "newlastseen",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newlastseen",
  aliases: [],
  category: "restored",
  description: "Restored: new_lastseen",
  usage: ".newlastseen",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
