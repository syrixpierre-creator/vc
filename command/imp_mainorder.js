/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for main-order.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "main-order.js",
  family: "B",
  command: "mainorder",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mainorder",
  aliases: [],
  category: "restored",
  description: "Restored: main-order",
  usage: ".mainorder",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
