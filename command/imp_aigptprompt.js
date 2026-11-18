/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-gptprompt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-gptprompt.js",
  family: "A",
  command: "aigptprompt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aigptprompt",
  aliases: [],
  category: "restored",
  description: "Restored: ai-gptprompt",
  usage: ".aigptprompt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
