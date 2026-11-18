/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for infogempa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "infogempa.js",
  family: "A",
  command: "xinfogempa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xinfogempa",
  aliases: [],
  category: "restored",
  description: "Restored: infogempa",
  usage: ".xinfogempa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
