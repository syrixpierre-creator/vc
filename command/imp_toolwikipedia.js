/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-wikipedia.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-wikipedia.js",
  family: "B",
  command: "toolwikipedia",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolwikipedia",
  aliases: [],
  category: "restored",
  description: "Restored: tool-wikipedia",
  usage: ".toolwikipedia",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
