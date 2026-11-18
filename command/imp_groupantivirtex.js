/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-antivirtex.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-antivirtex.js",
  family: "B",
  command: "groupantivirtex",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupantivirtex",
  aliases: [],
  category: "restored",
  description: "Restored: group-antivirtex",
  usage: ".groupantivirtex",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
