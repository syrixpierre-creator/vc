/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-tempmail.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-tempmail.js",
  family: "B",
  command: "toolstempmail",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolstempmail",
  aliases: [],
  category: "restored",
  description: "Restored: tools-tempmail",
  usage: ".toolstempmail",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
