/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for channel-id2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "channel-id2.js",
  family: "B",
  command: "channelid2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "channelid2",
  aliases: [],
  category: "restored",
  description: "Restored: channel-id2",
  usage: ".channelid2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
