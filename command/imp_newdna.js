/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_dna.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_dna.js",
  family: "B",
  command: "newdna",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newdna",
  aliases: [],
  category: "restored",
  description: "Restored: new_dna",
  usage: ".newdna",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
