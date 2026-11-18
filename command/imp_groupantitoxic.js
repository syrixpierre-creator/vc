/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-antitoxic.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-antitoxic.js",
  family: "B",
  command: "groupantitoxic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupantitoxic",
  aliases: [],
  category: "restored",
  description: "Restored: group-antitoxic",
  usage: ".groupantitoxic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
