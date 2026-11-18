/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_speedtest.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_speedtest.js",
  family: "A",
  command: "newspeedtest",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newspeedtest",
  aliases: [],
  category: "restored",
  description: "Restored: new_speedtest",
  usage: ".newspeedtest",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
