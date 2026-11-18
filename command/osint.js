/**
 * QUEEN AKUMA • OSINT commands — free, no-key public sources.
 * .ipinfo <ip>      — IP location/ISP (ip-api.com)
 * .domain <domain>  — domain whois (RDAP, rdap.org)
 * .phoneinfo <num>  — phone parse, country/type (offline, libphonenumber)
 * .bin <6 digits>   — card BIN info (binlist.net)
 * .username <name>  — GitHub profile check
 * Note: ye sirf PUBLIC information dikhate hain. Kisi ki private info
 * nikalna ya galat istemal karna allowed nahi hai.
 */
const T = require('../lib/smartTools');

function make(cmd, aliases, desc, usage, run) {
  return {
    command: cmd, aliases, category: 'osint', description: desc, usage,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const input = (args || []).join(' ').trim();
      if (!input) return reply(`❌ Usage: ${usage}`);
      try { await reply(await run(input)); }
      catch (e) { await reply('❌ ' + String((e && e.message) || e).slice(0, 250)); }
    },
  };
}

module.exports = {
  commands: [
    make('ipinfo', ['ip', 'iplookup'], 'IP address info (location, ISP)', '.ipinfo 8.8.8.8',
      async (ip) => T.formatIp(await T.ipInfo(ip))),
    make('domain', ['whois', 'domaininfo'], 'Domain whois info (RDAP)', '.domain google.com',
      async (d) => T.formatDomain(await T.domainInfo(d.replace(/^https?:\/\//, '').split('/')[0]))),
    make('phoneinfo', ['numinfo', 'numberinfo'], 'Phone number info (country, type)', '.phoneinfo 919876543210',
      async (n) => T.formatPhone(T.phoneInfo(n))),
    make('bin', ['bininfo', 'binfo'], 'Card BIN info (bank, scheme, country)', '.bin 457173',
      async (b) => {
        if (!/^\d{6,8}$/.test(b)) throw new Error('BIN 6-8 digits ka hota hai, jaise: .bin 457173');
        return T.formatBin(await T.binInfo(b), b);
      }),
    make('username', ['usercheck', 'ghuser'], 'Check GitHub username/profile', '.username torvalds',
      async (u) => T.formatGithub(await T.githubUser(u.replace(/^@/, '')))),
    {
      command: 'osintlist',
      aliases: ['newosint'],
      category: 'osint',
      description: 'List new free OSINT commands',
      usage: '.osintlist',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        await sock.sendMessage(chatId, { text: `🕵️ *QUEEN AKUMA OSINT*\n\n• .ipinfo <ip> — IP location, ISP, proxy check\n• .domain <domain> — domain whois (RDAP)\n• .phoneinfo <number> — phone country, type, valid?\n• .bin <6 digits> — card BIN: bank, scheme, country\n• .username <name> — GitHub profile check\n\n⚠️ Sirf public info ke liye. Private data nikalna allowed nahi hai.` }, { quoted: message });
      },
    },
  ],
};
