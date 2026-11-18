/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for istock.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "istock.js",
  family: "A",
  command: "istock",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "istock",
  aliases: [],
  category: "restored",
  description: "Restored: istock",
  usage: ".istock",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
