/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-truth.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-truth.js",
  family: "B",
  command: "funtruth",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funtruth",
  aliases: [],
  category: "restored",
  description: "Restored: fun-truth",
  usage: ".funtruth",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
