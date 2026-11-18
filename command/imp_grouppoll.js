/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-poll.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-poll.js",
  family: "B",
  command: "grouppoll",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouppoll",
  aliases: [],
  category: "restored",
  description: "Restored: group-poll",
  usage: ".grouppoll",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
