/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for scheduleMessage.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "scheduleMessage.js",
  family: "B",
  command: "schedulemessage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "schedulemessage",
  aliases: [],
  category: "restored",
  description: "Restored: scheduleMessage",
  usage: ".schedulemessage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
