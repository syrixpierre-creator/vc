const { run } = require('../lib/compat');
const META = {
  file: "downloader-douyin.js",
  family: "A",
  command: "douyin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "douyin",
  aliases: [],
  category: "misc",
  description: "New plugin: douyin",
  usage: ".douyin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
