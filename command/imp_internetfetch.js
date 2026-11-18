/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-fetch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-fetch.js",
  family: "B",
  command: "internetfetch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetfetch",
  aliases: [],
  category: "restored",
  description: "Restored: internet-fetch",
  usage: ".internetfetch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
