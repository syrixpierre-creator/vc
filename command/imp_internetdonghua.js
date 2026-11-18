/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-donghua.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-donghua.js",
  family: "B",
  command: "internetdonghua",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetdonghua",
  aliases: [],
  category: "restored",
  description: "Restored: internet-donghua",
  usage: ".internetdonghua",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
