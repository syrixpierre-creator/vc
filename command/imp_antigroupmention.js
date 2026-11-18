/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antigroupmention.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antigroupmention.js",
  family: "B",
  command: "antigroupmention",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antigroupmention",
  aliases: [],
  category: "restored",
  description: "Restored: antigroupmention",
  usage: ".antigroupmention",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
