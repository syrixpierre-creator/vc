/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for addmoney.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "addmoney.js",
  family: "A",
  command: "xaddmoney",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xaddmoney",
  aliases: [],
  category: "restored",
  description: "Restored: addmoney",
  usage: ".xaddmoney",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
