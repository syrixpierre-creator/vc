/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for setbotvideo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "setbotvideo.js",
  family: "A",
  command: "setbotvideo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "setbotvideo",
  aliases: [],
  category: "restored",
  description: "Restored: setbotvideo",
  usage: ".setbotvideo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
