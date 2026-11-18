/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for source.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "source.js",
  family: "A",
  command: "source",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "source",
  aliases: [],
  category: "restored",
  description: "Restored: source",
  usage: ".source",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
