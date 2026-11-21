/**
 * QUEEN AKUMA — Anti View-Once (antivv)
 * .antivv on|off|status
 * .antivv action delete|warn|kick
 */
const groupAnti = require('../lib/groupAnti');

module.exports = {
  command: 'antivv',
  aliases: ['antiviewonce', 'antivo', 'viewonceblock'],
  category: 'group',
  description: 'Block view-once media in group',
  usage: '.antivv on|off|status|action <delete|warn|kick>',
  groupOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    if (!String(chatId).endsWith('@g.us')) {
      return reply('❌ *This command can only be used in groups!*');
    }

    const sub = (args[0] || '').toLowerCase();
    const arg2 = (args[1] || '').toLowerCase();
    // v3.6.0 OWNER/ADMIN LOCK — sirf owner ya group admin on/off/action badal sakta hai (status public).
    const isSet = sub === 'on' || sub === '1' || sub === 'true' || sub === 'enable' || sub === 'off' || sub === '0' || sub === 'false' || sub === 'disable' || ((sub === 'action' || sub === 'mode' || sub === 'set') && ['delete', 'warn', 'kick'].includes(arg2));
    if (isSet && !(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return reply('❌ *Only group admins or the bot owner can use this command.*');
    const db = groupAnti.load();
    const isOn = groupAnti.isOn(db, chatId, 'antivv');
    const action = groupAnti.getAction(db, 'antivv');

    // .antivv action delete|warn|kick
    if (sub === 'action' || sub === 'mode' || sub === 'set') {
      if (!['delete', 'warn', 'kick'].includes(arg2)) {
        return reply(
`✅ *Anti-VV action: ${action}*

Available options:
- delete
- warn
- kick`
        );
      }
      groupAnti.setAction('antivv', arg2);
      return reply(`✅ *Anti-VV action* set: *${arg2}*`);
    }

    if (sub === 'on' || sub === '1' || sub === 'true' || sub === 'enable') {
      groupAnti.setOn(chatId, 'antivv', true);
      return reply(
`✅ *Anti View-Once ON*

View-once photo/video/voice ab block honge.
Action: *${groupAnti.getAction(groupAnti.load(), 'antivv')}*

Change action:
\`.antivv action delete\`
\`.antivv action warn\`
\`.antivv action kick\``
      );
    }

    if (sub === 'off' || sub === '0' || sub === 'false' || sub === 'disable') {
      groupAnti.setOn(chatId, 'antivv', false);
      return reply('❌ *Anti View-Once OFF*\nView-once messages allow.');
    }

    // status / help
    return reply(
`✅ *Anti-VV: ${isOn ? 'ON' : 'OFF'}* (action: ${action})

Available options:
- on
- off
- action delete|warn|kick`
    );
  }
};
