/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bratbutton.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bratbutton.js",
  family: "A",
  command: "bratbutton",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "bratbutton",
  aliases: [],
  category: "restored",
  description: "Restored: bratbutton",
  usage: ".bratbutton",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
