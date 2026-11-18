/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gpt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gpt.js",
  family: "B",
  command: 'gptx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gpt",
  aliases: [],
  category: "restored",
  description: "Restored: gpt",
  usage: ".gpt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
