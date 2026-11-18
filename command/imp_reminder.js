/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for reminder.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "reminder.js",
  family: "A",
  command: "reminder",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "reminder",
  aliases: [],
  category: "restored",
  description: "Restored: reminder",
  usage: ".reminder",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
