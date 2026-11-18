/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-spamwa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-spamwa.js",
  family: "B",
  command: "toolspamwa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolspamwa",
  aliases: [],
  category: "restored",
  description: "Restored: tool-spamwa",
  usage: ".toolspamwa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
