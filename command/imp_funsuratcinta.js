/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-suratcinta.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-suratcinta.js",
  family: "A",
  command: "funsuratcinta",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funsuratcinta",
  aliases: [],
  category: "restored",
  description: "Restored: fun-suratcinta",
  usage: ".funsuratcinta",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
