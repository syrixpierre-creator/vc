/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-polling.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-polling.js",
  family: "B",
  command: "grouppolling",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouppolling",
  aliases: [],
  category: "restored",
  description: "Restored: group-polling",
  usage: ".grouppolling",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
