const { run } = require('../lib/compat');
const META = {
  file: "komik.js",
  family: "A",
  command: "komiksearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "komiksearch",
  aliases: ["komikdetail"],
  category: "misc",
  description: "New plugin: komiksearch",
  usage: ".komiksearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
