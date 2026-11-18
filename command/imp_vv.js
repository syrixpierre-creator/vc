/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for _vv.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "_vv.js",
  family: "B",
  command: 'vvx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "vvalt",
  aliases: [],
  category: "restored",
  description: "Restored: _vv",
  usage: ".vv",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
