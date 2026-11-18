/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for groq.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "groq.js",
  family: "B",
  command: "groq",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groq",
  aliases: [],
  category: "restored",
  description: "Restored: groq",
  usage: ".groq",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
