/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-source.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-source.js",
  family: "B",
  command: "toolssource",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolssource",
  aliases: [],
  category: "restored",
  description: "Restored: tools-source",
  usage: ".toolssource",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
