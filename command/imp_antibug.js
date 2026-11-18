/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antibug.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antibug.js",
  family: "B",
  command: 'antibugalt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antibug",
  aliases: [],
  category: "restored",
  description: "Restored: antibug",
  usage: ".antibug",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
