/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for channelid.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "channelid.js",
  family: "A",
  command: "channelid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "channelid",
  aliases: [],
  category: "restored",
  description: "Restored: channelid",
  usage: ".channelid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
