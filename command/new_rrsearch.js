const { run } = require('../lib/compat');
const META = {
  file: "novel-royalroad.js",
  family: "A",
  command: "rrsearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "rrsearch",
  aliases: ["rrdetail", "rrlatest", "rrprofile"],
  category: "misc",
  description: "New plugin: rrsearch",
  usage: ".rrsearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
