/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for npmstalk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "npmstalk.js",
  family: "A",
  command: "npmstalk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "npmstalk",
  aliases: [],
  category: "restored",
  description: "Restored: npmstalk",
  usage: ".npmstalk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
