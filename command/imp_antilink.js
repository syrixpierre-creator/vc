/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for _antilink.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "_antilink.js",
  family: "B",
  command: 'antilinkx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antilinkalt",
  aliases: [],
  category: "restored",
  description: "Restored: _antilink",
  usage: ".antilink",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
