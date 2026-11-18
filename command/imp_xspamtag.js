/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for spamtag.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "spamtag.js",
  family: "A",
  command: "xspamtag",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xspamtag",
  aliases: [],
  category: "restored",
  description: "Restored: spamtag",
  usage: ".xspamtag",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
