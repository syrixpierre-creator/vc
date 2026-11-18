/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anti-once.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anti-once.js",
  family: "B",
  command: "antionce",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antionce",
  aliases: [],
  category: "restored",
  description: "Restored: anti-once",
  usage: ".antionce",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
