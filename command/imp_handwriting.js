/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for handwriting.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "handwriting.js",
  family: "A",
  command: "handwriting",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "handwriting",
  aliases: [],
  category: "restored",
  description: "Restored: handwriting",
  usage: ".handwriting",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
