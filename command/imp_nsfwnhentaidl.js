/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-nhentaidl.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-nhentaidl.js",
  family: "B",
  command: "nsfwnhentaidl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwnhentaidl",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-nhentaidl",
  usage: ".nsfwnhentaidl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
