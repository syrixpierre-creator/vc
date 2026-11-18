/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_timer.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_timer.js",
  family: "A",
  command: "newtimer",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newtimer",
  aliases: [],
  category: "restored",
  description: "Restored: new_timer",
  usage: ".newtimer",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
