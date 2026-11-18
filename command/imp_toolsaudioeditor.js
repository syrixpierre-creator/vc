/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-audioeditor.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-audioeditor.js",
  family: "B",
  command: "toolsaudioeditor",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsaudioeditor",
  aliases: [],
  category: "restored",
  description: "Restored: tools-audioeditor",
  usage: ".toolsaudioeditor",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
