/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-mimpi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-mimpi.js",
  family: "B",
  command: "funmimpi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funmimpi",
  aliases: [],
  category: "restored",
  description: "Restored: fun-mimpi",
  usage: ".funmimpi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
