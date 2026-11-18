/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for element.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "element.js",
  family: "A",
  command: "element",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "element",
  aliases: [],
  category: "restored",
  description: "Restored: element",
  usage: ".element",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
