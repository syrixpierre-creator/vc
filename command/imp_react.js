/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for react.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "react.js",
  family: "B",
  command: "react",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "react",
  aliases: [],
  category: "restored",
  description: "Restored: react",
  usage: ".react",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
