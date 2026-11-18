/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-wanted.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-wanted.js",
  family: "B",
  command: "toolswanted",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolswanted",
  aliases: [],
  category: "restored",
  description: "Restored: tools-wanted",
  usage: ".toolswanted",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
