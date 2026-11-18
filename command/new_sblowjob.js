const { run } = require('../lib/compat');
const META = {
  file: "nsfw-sblowjob.js",
  family: "A",
  command: "sblowjob",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sblowjob",
  aliases: [],
  category: "misc",
  description: "New plugin: sblowjob",
  usage: ".sblowjob",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
