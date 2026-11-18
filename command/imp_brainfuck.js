/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for brainfuck.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "brainfuck.js",
  family: "A",
  command: "brainfuck",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "brainfuck",
  aliases: [],
  category: "restored",
  description: "Restored: brainfuck",
  usage: ".brainfuck",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
