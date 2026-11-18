/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-tomp3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-tomp3.js",
  family: "B",
  command: "toolstomp3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolstomp3",
  aliases: [],
  category: "restored",
  description: "Restored: tools-tomp3",
  usage: ".toolstomp3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
