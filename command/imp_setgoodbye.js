/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for setgoodbye.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "setgoodbye.js",
  family: "B",
  command: "setgoodbye",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "setgoodbye",
  aliases: [],
  category: "restored",
  description: "Restored: setgoodbye",
  usage: ".setgoodbye",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
