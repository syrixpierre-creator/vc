/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_llama.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_llama.js",
  family: "A",
  command: "newllama",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newllama",
  aliases: [],
  category: "restored",
  description: "Restored: new_llama",
  usage: ".newllama",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
