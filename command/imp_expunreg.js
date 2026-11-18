/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for exp-unreg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "exp-unreg.js",
  family: "B",
  command: "expunreg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "expunreg",
  aliases: [],
  category: "restored",
  description: "Restored: exp-unreg",
  usage: ".expunreg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
