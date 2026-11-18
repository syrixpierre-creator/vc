/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-cecanthailand.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-cecanthailand.js",
  family: "A",
  command: "randomcecanthailand",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randomcecanthailand",
  aliases: [],
  category: "restored",
  description: "Restored: random-cecanthailand",
  usage: ".randomcecanthailand",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
