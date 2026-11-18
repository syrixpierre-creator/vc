/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fakevCard.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fakevCard.js",
  family: "B",
  command: "fakevcard",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "fakevcard",
  aliases: [],
  category: "restored",
  description: "Restored: fakevCard",
  usage: ".fakevcard",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
