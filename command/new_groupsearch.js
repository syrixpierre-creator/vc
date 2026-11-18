const { run } = require('../lib/compat');
const META = {
  file: "internet-groupsearch.js",
  family: "A",
  command: "groupsearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "groupsearch",
  aliases: [],
  category: "misc",
  description: "New plugin: groupsearch",
  usage: ".groupsearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
