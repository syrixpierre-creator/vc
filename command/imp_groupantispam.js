/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-antispam.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-antispam.js",
  family: "B",
  command: "groupantispam",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupantispam",
  aliases: [],
  category: "restored",
  description: "Restored: group-antispam",
  usage: ".groupantispam",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
