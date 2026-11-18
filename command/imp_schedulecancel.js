/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for schedulecancel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "schedulecancel.js",
  family: "B",
  command: "schedulecancel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "schedulecancel",
  aliases: [],
  category: "restored",
  description: "Restored: schedulecancel",
  usage: ".schedulecancel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
