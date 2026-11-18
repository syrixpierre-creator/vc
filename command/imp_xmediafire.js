/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for mediafire.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "mediafire.js",
  family: "A",
  command: "xmediafire",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xmediafire",
  aliases: [],
  category: "restored",
  description: "Restored: mediafire",
  usage: ".xmediafire",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
