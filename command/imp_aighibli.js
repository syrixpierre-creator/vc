/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-ghibli.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-ghibli.js",
  family: "B",
  command: "aighibli",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aighibli",
  aliases: [],
  category: "restored",
  description: "Restored: ai-ghibli",
  usage: ".aighibli",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
