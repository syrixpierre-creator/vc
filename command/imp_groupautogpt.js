/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-autogpt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-autogpt.js",
  family: "B",
  command: "groupautogpt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupautogpt",
  aliases: [],
  category: "restored",
  description: "Restored: group-autogpt",
  usage: ".groupautogpt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
