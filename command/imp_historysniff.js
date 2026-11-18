/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for historysniff.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "historysniff.js",
  family: "A",
  command: "historysniff",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "historysniff",
  aliases: [],
  category: "restored",
  description: "Restored: historysniff",
  usage: ".historysniff",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
