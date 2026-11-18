/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-unbanchat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-unbanchat.js",
  family: "B",
  command: "ownerunbanchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerunbanchat",
  aliases: [],
  category: "restored",
  description: "Restored: owner-unbanchat",
  usage: ".ownerunbanchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
