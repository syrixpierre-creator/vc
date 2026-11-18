/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stalk-ttstalk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stalk-ttstalk.js",
  family: "B",
  command: "stalkttstalk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stalkttstalk",
  aliases: [],
  category: "restored",
  description: "Restored: stalk-ttstalk",
  usage: ".stalkttstalk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
