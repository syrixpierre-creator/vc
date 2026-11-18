/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-morse.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-morse.js",
  family: "A",
  command: "toolmorse",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolmorse",
  aliases: [],
  category: "restored",
  description: "Restored: tool-morse",
  usage: ".toolmorse",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
