/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for AntiSpam.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "AntiSpam.js",
  family: "B",
  command: 'antispamalt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "antispam",
  aliases: [],
  category: "restored",
  description: "Restored: AntiSpam",
  usage: ".antispam",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
