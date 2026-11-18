/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-ytstalk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-ytstalk.js",
  family: "B",
  command: "toolytstalk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolytstalk",
  aliases: [],
  category: "restored",
  description: "Restored: tool-ytstalk",
  usage: ".toolytstalk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
