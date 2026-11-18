const { run } = require('../lib/compat');
const META = {
  file: "down-igmp3.js",
  family: "A",
  command: "igmp3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "igmp3",
  aliases: [],
  category: "misc",
  description: "New plugin: igmp3",
  usage: ".igmp3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
