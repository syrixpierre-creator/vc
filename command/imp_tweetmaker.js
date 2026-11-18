/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tweetmaker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tweetmaker.js",
  family: "B",
  command: "tweetmaker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tweetmaker",
  aliases: [],
  category: "restored",
  description: "Restored: tweetmaker",
  usage: ".tweetmaker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
