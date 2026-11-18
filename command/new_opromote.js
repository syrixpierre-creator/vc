const { run } = require('../lib/compat');
const META = {
  file: "owner-promote.js",
  family: "A",
  command: "opromote",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "opromote",
  aliases: [],
  category: "misc",
  description: "New plugin: opromote",
  usage: ".opromote",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
