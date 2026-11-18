/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-tweet.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-tweet.js",
  family: "B",
  command: "makertweet",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makertweet",
  aliases: [],
  category: "restored",
  description: "Restored: maker-tweet",
  usage: ".makertweet",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
