/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for greetdm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "greetdm.js",
  family: "B",
  command: "greetdm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "greetdm",
  aliases: [],
  category: "restored",
  description: "Restored: greetdm",
  usage: ".greetdm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
