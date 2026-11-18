/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-upgh.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-upgh.js",
  family: "A",
  command: "toolsupgh",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsupgh",
  aliases: [],
  category: "restored",
  description: "Restored: tools-upgh",
  usage: ".toolsupgh",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
