const { run } = require('../lib/compat');
const META = {
  file: "maker-sertifikatlemot.js",
  family: "A",
  command: "sertifikatlemot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sertifikatlemot",
  aliases: [],
  category: "misc",
  description: "New plugin: sertifikatlemot",
  usage: ".sertifikatlemot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
