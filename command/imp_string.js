/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for string.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "string.js",
  family: "A",
  command: "string",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "string",
  aliases: [],
  category: "restored",
  description: "Restored: string",
  usage: ".string",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
