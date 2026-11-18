/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-seberapagila.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-seberapagila.js",
  family: "A",
  command: "funseberapagila",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funseberapagila",
  aliases: [],
  category: "restored",
  description: "Restored: fun-seberapagila",
  usage: ".funseberapagila",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
