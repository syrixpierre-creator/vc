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
        return reply(`🎙️ *Voice Mode ${a === 'on' ? 'ON ✅' : 'OFF ❌'}*\n\n${a === 'on' ? 'Ab voice note bhejo — bot sunega aur command chalega.' : 'Voice notes ab text ki tarah ignore honge.'}\nLanguage: *${cfg.lang === 'hi' ? 'Hindi' : 'English'}* (.vlang hi|en)\nVoice reply: *${cfg.replyVoice ? 'ON' : 'OFF'}* (.voicemode reply on|off)`);
      }
      if (a === 'reply' && (b === 'on' || b === 'off')) {
        vm.saveConfig({ replyVoice: b === 'on' });
        return reply(`🔊 *Voice reply ${b === 'on' ? 'ON ✅' : 'OFF ❌'}*`);
      }
      const key = (process.env.GROQ_API_KEY ? '✅ Groq' : (process.env.WIT_AI_TOKEN ? '✅ Wit.ai' : '❌ koi STT key nahi'));
      return reply(`🎙️ *Voice Mode*\n\nStatus: *${cfg.enabled ? 'ON ✅' : 'OFF ❌'}*\nLanguage: *${cfg.lang === 'hi' ? 'Hindi' : 'English'}*\nVoice reply: *${cfg.replyVoice ? 'ON' : 'OFF'}*\nSTT key: ${key}\n\n*.voicemode on|off* — toggle\n*.voicemode reply on|off* — jawab voice me ya text me\n*.vlang hi|en* — language\n*.bol <text>* — text ko voice note banao\n\n${key.startsWith('❌') ? '⚠️ Key ke bina voice note kaam nahi karega.\nFree key: console.groq.com → GROQ_API_KEY env me daalo.\nDetails: VOICE_MODE.md' : '✅ Voice note bhejo, try karo!'}`);
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
      if (lang !== 'hi' && lang !== 'en') return reply('❌ Usage: `.vlang hi` ya `.vlang en`');
      vm.saveConfig({ lang });
      return reply(`🌐 *Voice language: ${lang === 'hi' ? 'Hindi 🇮🇳' : 'English 🇬🇧'}*\nAb voice notes isi language me sune jayenge.`);
    }
  }
] };
