/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-kematian.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-kematian.js",
  family: "A",
  command: "funkematian",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funkematian",
  aliases: [],
  category: "restored",
  description: "Restored: fun-kematian",
  usage: ".funkematian",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
