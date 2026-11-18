/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-dare.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-dare.js",
  family: "B",
  command: "fundare",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "fundare",
  aliases: [],
  category: "restored",
  description: "Restored: fun-dare",
  usage: ".fundare",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
