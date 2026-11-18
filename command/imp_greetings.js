/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for greetings.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "greetings.js",
  family: "B",
  command: "greetings",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "greetings",
  aliases: [],
  category: "restored",
  description: "Restored: greetings",
  usage: ".greetings",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
