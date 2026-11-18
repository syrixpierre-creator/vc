/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-gantengcek.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-gantengcek.js",
  family: "A",
  command: "fungantengcek",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "fungantengcek",
  aliases: [],
  category: "restored",
  description: "Restored: fun-gantengcek",
  usage: ".fungantengcek",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
