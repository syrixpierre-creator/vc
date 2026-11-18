/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-faketweet.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-faketweet.js",
  family: "A",
  command: "makerfaketweet",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfaketweet",
  aliases: [],
  category: "restored",
  description: "Restored: maker-faketweet",
  usage: ".makerfaketweet",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
