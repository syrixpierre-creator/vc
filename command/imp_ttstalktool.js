/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ttstalk-tool.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ttstalk-tool.js",
  family: "B",
  command: "ttstalktool",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ttstalktool",
  aliases: [],
  category: "restored",
  description: "Restored: ttstalk-tool",
  usage: ".ttstalktool",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
