/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for prem-jadibot.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "prem-jadibot.js",
  family: "B",
  command: "premjadibot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "premjadibot",
  aliases: [],
  category: "restored",
  description: "Restored: prem-jadibot",
  usage: ".premjadibot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
