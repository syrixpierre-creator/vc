const settings = require('../settings.js');
const { getAutoDetectMode, setAutoDetectMode } = require('../lib/vv-settings.js');

function isOwner(m) {
  const ownerNumber = String(settings.ownerNumber || '').replace(/\D/g, '');
  const sender = String(m.key.participant || m.participant || m.key.remoteJid || '').replace(/\D/g, '');
  return Boolean(m.key.fromMe || (ownerNumber && sender.includes(ownerNumber)));
}

async function setAutoDetectVvCommand(sock, m, args) {
  const chatId = m.key.remoteJid;
  if (!isOwner(m)) {
    return sock.sendMessage(chatId, { text: '❌ Sirf bot owner `.setdetectvv` mode change kar sakta hai.' }, { quoted: m });
  }

  const option = String(args[0] || '').toLowerCase();
  const current = getAutoDetectMode(chatId);
  if (option === 'private' || option === 'on') {
    setAutoDetectMode(chatId, 'private');
    return sock.sendMessage(chatId, {
      text: '✅ Auto ViewOnce detection *private* mode mein ON hai.\nIs group/DM mein aane wali ViewOnce image, video ya audio sirf connected bot number par recover hogi.'
    }, { quoted: m });
  }
  if (option === 'off') {
    setAutoDetectMode(chatId, null);
    return sock.sendMessage(chatId, { text: '✅ Auto ViewOnce detection OFF ho gaya.' }, { quoted: m });
  }
  if (option === 'status' || !option) {
    return sock.sendMessage(chatId, {
      text: `ℹ️ Auto ViewOnce detection: *${current || 'off'}*\nUse: \\.setdetectvv on/private, \\.setdetectvv status, ya \\.setdetectvv off`
    }, { quoted: m });
  }
  return sock.sendMessage(chatId, {
    text: '❌ Sirf private mode available hai. Use: `.setdetectvv on`, `.setdetectvv private`, `.setdetectvv status`, ya `.setdetectvv off`.'
  }, { quoted: m });
}

setAutoDetectVvCommand.aliases = ['setdetectvv'];
module.exports = setAutoDetectVvCommand;
