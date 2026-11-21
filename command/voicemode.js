/**
 * QUEEN AKUMA v3.0.0 — Voice Mode commands
 * .voicemode on|off|reply on|off — owner-only toggle + status
 * .vlang hi|en — STT/TTS language (owner-only)
 */
const isOwnerOrSudo = require('../lib/isOwner');
const vm = require('../lib/voiceMode');

function isOwner(senderJid, sock, chatId) {
  return isOwnerOrSudo.isOwnerOnly(senderJid) || isOwnerOrSudo(senderJid, sock, chatId);
}

module.exports = { commands: [
  {
    command: 'voicemode',
    aliases: ['voicelist'],
    category: 'owner',
    description: 'Voice Mode on/off — voice note se command + voice reply',
    usage: '.voicemode on|off|reply on|off',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!message.key.fromMe && !await isOwner(senderJid, sock, chatId)) return reply('🚫 *You are not authorized to use this command!*');
      const cfg = vm.getConfig();
      const a = (args[0] || '').toLowerCase();
      const b = (args[1] || '').toLowerCase();
      if (a === 'on' || a === 'off') {
        vm.saveConfig({ enabled: a === 'on' });
        return reply(`✅ *Voice mode ${a === 'on' ? 'ENABLED' : 'DISABLED'}*`);
      }
      if (a === 'reply' && (b === 'on' || b === 'off')) {
        vm.saveConfig({ replyVoice: b === 'on' });
        return reply(`🔊 *Voice reply ${b === 'on' ? 'ON ✅' : 'OFF ❌'}*`);
      }
      const key = (process.env.GROQ_API_KEY ? '✅ Groq' : (process.env.WIT_AI_TOKEN ? '✅ Wit.ai' : '❌ no STT key'));
      return reply(`✅ *Voice mode: ${cfg.enabled ? 'ON' : 'OFF'}*\n\nAvailable options:\n- on\n- off\n- reply on|off`);
    }
  },
  {
    command: 'vlang',
    aliases: [],
    category: 'owner',
    description: 'Voice Mode language hi/en',
    usage: '.vlang hi|en',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!message.key.fromMe && !await isOwner(senderJid, sock, chatId)) return reply('🚫 *You are not authorized to use this command!*');
      const lang = (args[0] || '').toLowerCase();
      if (lang !== 'hi' && lang !== 'en') return reply('❌ Usage: `.vlang hi` or `.vlang en`');
      vm.saveConfig({ lang });
      return reply(`🌐 *Voice language: ${lang === 'hi' ? 'Hindi 🇮🇳' : 'English 🇬🇧'}*\nAb voice notes isi language me sune jayenge.`);
    }
  }
] };
