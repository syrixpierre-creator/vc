/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for birthdaylist.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "birthdaylist.js",
  family: "A",
  command: "birthdaylist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "birthdaylist",
  aliases: [],
  category: "restored",
  description: "Restored: birthdaylist",
  usage: ".birthdaylist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
