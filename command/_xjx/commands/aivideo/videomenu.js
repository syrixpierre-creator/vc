const config = require("../../config");
module.exports = {
  'name': "videomenu",
  'aliases': ["vidmenu", "aividmenu", "videoeffects"],
  'description': "Show AI video effect commands",
  'category': 'aivideo',
  'usage': (config.prefix || '.') + "videomenu",
  async 'execute'(v1, v2, v3, v4 = {}) {
    const v5 = v2.key.remoteJid;
    const v6 = v4.prefix || config.prefix || '.';
    const v7 = ["🎬 AI video commands", '', v6 + 'tigervideo', v6 + 'introvideo', v6 + "lightningpubg", v6 + 'lovevideo', v6 + "videogen"].join("\n");
    return v1.sendMessage(v5, {
      'text': v7
    }, {
      'quoted': v2
    });
  }
};
