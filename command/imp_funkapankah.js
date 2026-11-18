/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-kapankah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-kapankah.js",
  family: "A",
  command: "funkapankah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funkapankah",
  aliases: [],
  category: "restored",
  description: "Restored: fun-kapankah",
  usage: ".funkapankah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
