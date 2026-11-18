/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for reactch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "reactch.js",
  family: "B",
  command: "xreactch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xreactch",
  aliases: [],
  category: "restored",
  description: "Restored: reactch",
  usage: ".xreactch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
