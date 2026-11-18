/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anticolong.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anticolong.js",
  family: "B",
  command: "anticolong",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "anticolong",
  aliases: [],
  category: "restored",
  description: "Restored: anticolong",
  usage: ".anticolong",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
