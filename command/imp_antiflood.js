/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antiflood.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antiflood.js",
  family: "B",
  command: "antiflood",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antiflood",
  aliases: [],
  category: "restored",
  description: "Restored: antiflood",
  usage: ".antiflood",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
