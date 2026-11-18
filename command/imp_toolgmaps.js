/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-gmaps.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-gmaps.js",
  family: "A",
  command: "toolgmaps",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolgmaps",
  aliases: [],
  category: "restored",
  description: "Restored: tool-gmaps",
  usage: ".toolgmaps",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
