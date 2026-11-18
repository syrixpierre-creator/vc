/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-editimg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-editimg.js",
  family: "A",
  command: "aieditimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aieditimg",
  aliases: [],
  category: "restored",
  description: "Restored: ai-editimg",
  usage: ".aieditimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
