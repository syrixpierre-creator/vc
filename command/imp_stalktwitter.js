/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stalk-twitter.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stalk-twitter.js",
  family: "B",
  command: "stalktwitter",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stalktwitter",
  aliases: [],
  category: "restored",
  description: "Restored: stalk-twitter",
  usage: ".stalktwitter",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
