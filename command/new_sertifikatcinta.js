const { run } = require('../lib/compat');
const META = {
  file: "maker-sertifikatcinta.js",
  family: "A",
  command: "sertifikatcinta",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sertifikatcinta",
  aliases: [],
  category: "misc",
  description: "New plugin: sertifikatcinta",
  usage: ".sertifikatcinta",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
