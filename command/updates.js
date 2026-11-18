/*****************************************************************************
 * QUEEN AKUMA — .updates / .changelog / .new
 * Last 15 days features list
 *****************************************************************************/
const settings = require('../settings');

function buildUpdates() {
  const bot = settings.botName || 'QUEEN AKUMA';
  return `*ׂ̣̣̣̣̇̇̇̇᛭*
*❀ 📢 ${bot} UPDATES*
*❀ Last 15 days · NEW*
*̣̣̣̣̇̇̇᛭*

*  CORE*
** Session pairing \`DEX~\` · Termux ready
** External menu video/image (chhota zip)
** Flat plugins · faster handler
** Fake vCard · © MADE BY INCONNU BOY SENSEI
** Private/public + temp access
** LID-safe owner/sudo
**

*  MENU / HELP*
** \`.menu\` — full list + video (parallel)
** \`.menu2\` — buttons / categories
** \`.help\` — har command ki detail
**

*  GROUP / ANTI / STATUS*
** \`.gstatus\` — group status/story
** \`.channelstatus\` — channel story
** \`.antidelete\` · \`.selfantidelete\`
** \`.antilink\` + anti* pack
** \`.welcome\` · \`.goodbye\`
**

*  AUTO / VIEWONCE*
** \`.autoreact\` · \`.autostatusreact\`
** \`.setdetectvv\` · \`.vv\`
**

*  AI*
** \`.dexbot on|off\` · \`.dexbot set\`
** \`.blackbox\` / \`.bb\` — Arslan AI
**

*  DOWNLOAD*
** Multi-API failover (fast switch)
** \`.ytmp4\` — YouTube MP4
** \`.leakvideo\` — fixed
** \`.play\` / \`.song\` — registry APIs
**

*  DEXAPI (API control)*
** \`.dexapi status\` · \`.dexapi cat\`
** \`.dexapi base\` · \`.dexapi key\`
** \`.dexapi set|add|del|enable|use\`
** ~60 templates · no code edit
**

*  OSINT HUB*
** \`.osint\` · \`.osintmenu\` · \`.detect\`
** \`.osintaccess\` — owner allow list
** \`.ipv1\` \`.num\` \`.pan\` \`.gst\` …
** \`.vehicle\` \`.github\` \`.imei\` …
** ~40+ OSINT cmds (owner + access)
**

*  OWNER*
** \`.sudo add|del|list\`
** \`.updates\` — ye list
**

_MADE BY INCONNU BOY SENSEI · ${bot}_
_Type \`.menu\` for full command list_`;
}

module.exports = {
  command: 'updates',
  aliases: ['changelog', 'new', 'whatsnew', 'update', 'news'],
  category: 'main',
  description: 'Last 15 days new features / commands list',
  usage: '.updates',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = buildUpdates();
    // split if needed (WA limit)
    if (text.length < 4000) {
      return sock.sendMessage(chatId, { text }, { quoted: message });
    }
    const mid = text.indexOf('*  DEXAPI');
    const p1 = mid > 0 ? text.slice(0, mid) : text.slice(0, 3500);
    const p2 = mid > 0 ? text.slice(mid) : text.slice(3500);
    await sock.sendMessage(chatId, { text: p1 }, { quoted: message });
    if (p2 && p2.trim()) {
      await sock.sendMessage(chatId, { text: p2 });
    }
  }
};
