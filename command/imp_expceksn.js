/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for exp-ceksn.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "exp-ceksn.js",
  family: "A",
  command: "expceksn",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "expceksn",
  aliases: [],
  category: "restored",
  description: "Restored: exp-ceksn",
  usage: ".expceksn",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
