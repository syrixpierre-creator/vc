/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for store-payment.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "store-payment.js",
  family: "B",
  command: "storepayment",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "storepayment",
  aliases: [],
  category: "restored",
  description: "Restored: store-payment",
  usage: ".storepayment",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
