/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for antivv.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "antivv.js",
  family: "A",
  command: 'antivvx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antivvalt",
  aliases: [],
  category: "restored",
  description: "Restored: antivv",
  usage: ".antivv",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
