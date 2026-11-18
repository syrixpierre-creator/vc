/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for playch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "playch.js",
  family: "B",
  command: "xplaych",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xplaych",
  aliases: [],
  category: "restored",
  description: "Restored: playch",
  usage: ".xplaych",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
