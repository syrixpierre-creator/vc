/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-igsearch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-igsearch.js",
  family: "A",
  command: "tooligsearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tooligsearch",
  aliases: [],
  category: "restored",
  description: "Restored: tool-igsearch",
  usage: ".tooligsearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
