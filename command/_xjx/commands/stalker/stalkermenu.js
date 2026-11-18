const config = require("../../config");
module.exports = {
  'name': "stalkercmd",
  'aliases': ["smenu", 'stalkermenu', "stalkercmds"],
  'description': "Shows all Stalker commands",
  'category': "Stalker Commands",
  async 'execute'(v1, v2, v3, v4) {
    const v5 = v2.key.remoteJid;
    const v6 = config.botName;
    const v7 = "┏━━『 🕵️ STALKER COMMANDS 』━━\n➥ WhatsApp Channel ➜ wachannel <URL>\n➥ TikTok           ➜ tiktokstalk <username>\n➥ Twitter/X        ➜ twitterstalk <username>\n➥ IP Address       ➜ ipstalk <IP>\n➥ Instagram        ➜ igstalk <username>\n➥ NPM Package      ➜ npmstalk <package>\n➥ GitHub           ➜ gitstalk <username>\n" + ("➥ Powered By       ➜ " + v6 + "\n") + "┗━━━━━━━━━━━━━━━━";
    await v1.sendMessage(v5, {
      'text': v7
    }, {
      'quoted': v2
    });
  }
};
