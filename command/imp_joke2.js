/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for joke2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "joke2.js",
  family: "A",
  command: "joke2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "joke2",
  aliases: [],
  category: "restored",
  description: "Restored: joke2",
  usage: ".joke2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
