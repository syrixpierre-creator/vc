/**
 * QUEEN AKUMA v3.3.0 — Developer Tools batch
 * .hash .jsonfmt .regex .dnscheck .sslcheck .apicheck .coderun (owner)
 * .totp .vault .encnote
 */
const crypto = require('crypto');
const dns = require('dns').promises;
const tls = require('tls');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { totp, randomSecret, aesEncrypt, aesDecrypt, sha256 } = require('../lib/devCrypto');

const VAULT_PATH = path.join(__dirname, '..', 'data', 'vault.json');
const ENC_PATH = path.join(__dirname, '..', 'data', 'encnotes.json');
const TOTP_PATH = path.join(__dirname, '..', 'data', 'totp.json');

function loadJson(p, def) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return def; } }
function saveJson(p, obj) { try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2)); } catch (_) {} }
function num(jid) { return String(jid || '').split('@')[0].replace(/:\d+$/, ''); }

module.exports = { commands: [
  {
    command: 'hash', aliases: [], category: 'tools',
    description: 'MD5 / SHA1 / SHA256 hash banao', usage: '.hash <md5|sha1|sha256> <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const algo = (args[0] || 'sha256').toLowerCase();
      const text = args.slice(1).join(' ');
      if (!['md5', 'sha1', 'sha256'].includes(algo) || !text) return reply('❌ Usage: `.hash sha256 hello` (md5/sha1/sha256)');
      const h = crypto.createHash(algo).update(text).digest('hex');
      return reply(`🔐 *${algo.toUpperCase()}*\n\n\`\`\`${h}\`\`\``);
    },
  },
  {
    command: 'jsonfmt', aliases: ['json'], category: 'tools',
    description: 'Format and validate JSON', usage: '.jsonfmt <json>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const q = (args || []).join(' ').trim();
      if (!q) return reply('❌ Usage: `.jsonfmt {"a":1}`');
      try {
        const obj = JSON.parse(q);
        return reply('✅ *Valid JSON*\n\n```\n' + JSON.stringify(obj, null, 2).slice(0, 3000) + '\n```');
      } catch (e) {
        return reply('❌ *Invalid JSON*\n\n' + String(e.message).slice(0, 300));
      }
    },
  },
  {
    command: 'regex', aliases: [], category: 'tools',
    description: 'Regex pattern test karo', usage: '.regex <pattern> <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const pattern = args[0];
      const text = args.slice(1).join(' ');
      if (!pattern || !text) return reply('❌ Usage: `.regex \\d+ abc123def456`');
      try {
        const re = new RegExp(pattern, 'g');
        const matches = [...text.matchAll(re)].map((m) => m[0]);
        return reply(matches.length ? `🔍 *Regex matches (${matches.length}):*\n\n${matches.map((m, i) => `${i + 1}. ${m}`).join('\n')}` : '❌ *No match found.*');
      } catch (e) {
        return reply('❌ Galat regex: ' + String(e.message).slice(0, 200));
      }
    },
  },
  {
    command: 'dnscheck', aliases: ['dns'], category: 'tools',
    description: 'DNS lookup of a domain', usage: '.dnscheck <domain>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const domain = (args[0] || '').replace(/^https?:\/\//, '').split('/')[0];
      if (!domain) return reply('❌ Usage: `.dnscheck google.com`');
      try {
        const [a, mx, txt] = await Promise.all([
          dns.resolve4(domain).catch(() => []),
          dns.resolveMx(domain).catch(() => []),
          dns.resolveTxt(domain).catch(() => []),
        ]);
        return reply(`🌐 *DNS — ${domain}*\n\n*A:* ${a.join(', ') || '—'}\n*MX:* ${mx.map((m) => m.exchange).join(', ') || '—'}\n*TXT:* ${txt.flat().join(' | ').slice(0, 300) || '—'}`);
      } catch (e) {
        return reply('❌ DNS lookup fail: ' + String(e.message).slice(0, 150));
      }
    },
  },
  {
    command: 'sslcheck', aliases: ['ssl'], category: 'tools',
    description: 'SSL certificate expiry check karo', usage: '.sslcheck <domain>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const domain = (args[0] || '').replace(/^https?:\/\//, '').split('/')[0];
      if (!domain) return reply('❌ Usage: `.sslcheck google.com`');
      try {
        const cert = await new Promise((resolve, reject) => {
          const socket = tls.connect(443, domain, { servername: domain }, () => {
            const c = socket.getPeerCertificate();
            socket.end();
            c ? resolve(c) : reject(new Error('No certificate'));
          });
          socket.setTimeout(10000, () => { socket.destroy(); reject(new Error('Timeout')); });
          socket.on('error', reject);
        });
        const exp = new Date(cert.valid_to);
        const days = Math.ceil((exp - Date.now()) / 86400000);
        return reply(`🔒 *SSL — ${domain}*\n\nIssuer: ${cert.issuer?.O || cert.issuer?.CN || '—'}\nValid to: ${exp.toDateString()}\n${days >= 0 ? `⏳ ${days} din bache hain ${days < 15 ? '⚠️ (jaldi renew karo!)' : '✅'}` : '❌ EXPIRED!'}`);
      } catch (e) {
        return reply('❌ SSL check fail: ' + String(e.message).slice(0, 150));
      }
    },
  },
  {
    command: 'apicheck', aliases: [], category: 'tools',
    description: 'See the response of any API', usage: '.apicheck <url>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      let url = args[0] || '';
      if (!/^https?:\/\//.test(url)) url = 'https://' + url;
      if (!url) return reply('❌ Usage: `.apicheck https://api.github.com`');
      try {
        const start = Date.now();
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15000);
        const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.3.0' } }).finally(() => clearTimeout(t));
        const body = (await res.text()).slice(0, 800);
        return reply(`🌐 *API Check*\n\nURL: ${url}\nStatus: *${res.status} ${res.statusText}*\nTime: ${Date.now() - start}ms\nContent-Type: ${res.headers.get('content-type') || '—'}\n\n\`\`\`\n${body}\n\`\`\``);
      } catch (e) {
        return reply('❌ API check fail: ' + String(e.message || e).slice(0, 150));
      }
    },
  },
  {
    command: 'coderun', aliases: ['jsrun'], category: 'tools',
    description: 'WhatsApp se JS code chalao (owner-only, sandbox)',
    usage: '.coderun <js code>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      let owner = false;
      try { const isOwner = require('../lib/isOwner'); owner = (isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)) || (await isOwner(senderJid, sock, chatId)); } catch (_) {}
      if (!owner) return reply('🚫 *You are not authorized to use this command!*');
      const code = (args || []).join(' ').trim();
      if (!code) return reply('❌ Usage: `.coderun 2+2` or `.coderun [1,2,3].map(x=>x*2)`');
      try {
        const sandbox = { Math, JSON, Date, console: { log: () => {} } };
        const script = new vm.Script(`(${code})`);
        const ctx = vm.createContext(sandbox);
        const out = script.runInContext(ctx, { timeout: 3000 });
        const text = typeof out === 'object' ? JSON.stringify(out, null, 2) : String(out);
        return reply(`💻 *Code Runner*\n\n\`\`\`js\n${code.slice(0, 500)}\n\`\`\`\n➡️ *Output:*\n\`\`\`\n${String(text).slice(0, 1500)}\n\`\`\``);
      } catch (e) {
        return reply('❌ Error: ' + String(e.message).slice(0, 300));
      }
    },
  },
  {
    command: 'totp', aliases: [], category: 'tools',
    description: '2FA TOTP codes banao (authenticator jaisa)',
    usage: '.totp | .totp set <secret> | .totp new',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const sub = (args[0] || '').toLowerCase();
      const db = loadJson(TOTP_PATH, { users: {} });
      const k = num(senderJid);
      if (sub === 'new') {
        const secret = randomSecret();
        db.users[k] = { secret };
        saveJson(TOTP_PATH, db);
        return reply(`🔑 *New TOTP secret*\n\n\`${secret}\`\n\nDo not share it.`);
      }
      if (sub === 'set') {
        const secret = (args[1] || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
        if (secret.length < 16) return reply('❌ Usage: `.totp set JBSWY3DPEHPK3PXP` (base32 secret, kam se kam 16 chars)');
        db.users[k] = { secret };
        saveJson(TOTP_PATH, db);
        return reply('✅ *TOTP secret saved.* Get a code: .totp');
      }
      const rec = db.users[k];
      if (!rec) return reply('❌ *Invalid option!*\n\nAvailable options:\n- set <secret>\n- new');
      try {
        const { code, remaining } = totp(rec.secret);
        return reply(`🔑 *TOTP Code:* \`${code}\`\n\n⏳ ${remaining} sec me expire hoga.`);
      } catch (e) {
        return reply('❌ *Invalid secret.*');
      }
    },
  },
  {
    command: 'vault', aliases: [], category: 'tools',
    description: 'Save passwords encrypted (master password)',
    usage: '.vault master <pass> | .vault add <site> <user> <pass> | .vault get <site>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const sub = (args[0] || '').toLowerCase();
      const db = loadJson(VAULT_PATH, { users: {} });
      const k = num(senderJid);
      if (!db.users[k]) db.users[k] = { masterHash: '', items: {} };
      const u = db.users[k];
      if (sub === 'master') {
        const pass = args.slice(1).join(' ');
        if (pass.length < 4) return reply('📌 *Usage:* .vault master <password> (min 4 chars, use in DM)');
        u.masterHash = sha256(pass);
        saveJson(VAULT_PATH, db);
        return reply('✅ *Master password set.*');
      }
      if (!u.masterHash) return reply('📌 *Usage:* .vault master <password> (use in DM)');
      if (sub === 'add') {
        const site = args[1];
        const user = args[2];
        const pass = args.slice(3).join(' ');
        if (!site || !user || !pass) return reply('❌ Usage: `.vault add <site> <username> <password>`');
        const masterPass = args[args.length - 1];
        u.items[site.toLowerCase()] = { user, enc: aesEncrypt(pass, u.masterHash.slice(0, 16)) };
        saveJson(VAULT_PATH, db);
        return reply(`✅ *${site} saved (encrypted).*`);
      }
      if (sub === 'get') {
        const site = (args[1] || '').toLowerCase();
        const item = u.items[site];
        if (!item) return reply('❌ *This site is not in the vault.*');
        try {
          const pass = aesDecrypt(item.enc, u.masterHash.slice(0, 16));
          return reply(`🔐 *${site}*\n\nUser: \`${item.user}\`\nPass: \`${pass}\``);
        } catch (_) {
          return reply('❌ *Decrypt failed. Wrong master password?*');
        }
      }
      if (sub === 'list') {
        const sites = Object.keys(u.items);
        return reply(sites.length ? `🔐 *Vault (${sites.length}):*\n\n${sites.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : '🔐 Vault khaali hai.');
      }
      if (sub === 'del') {
        const site = (args[1] || '').toLowerCase();
        if (!u.items[site]) return reply('❌ *This site is not in the vault.*');
        delete u.items[site];
        saveJson(VAULT_PATH, db);
        return reply(`✅ *${site}* delete kar diya.`);
      }
      return reply('❌ *Invalid option!*\n\nAvailable options:\n- master <pass>\n- add <site> <user> <pass>\n- get <site>\n- list\n- del <site>');
    },
  },
  {
    command: 'encnote', aliases: [], category: 'tools',
    description: 'AES encrypted notes save karo',
    usage: '.encnote add <pass> <text> | .encnote list <pass> | .encnote get <pass> <id>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const sub = (args[0] || '').toLowerCase();
      const db = loadJson(ENC_PATH, { users: {} });
      const k = num(senderJid);
      if (!db.users[k]) db.users[k] = [];
      const notes = db.users[k];
      if (sub === 'add') {
        const pass = args[1];
        const text = args.slice(2).join(' ');
        if (!pass || !text) return reply('❌ Usage: `.encnote add <password> <note text>`');
        notes.push({ id: notes.length + 1, enc: aesEncrypt(text, pass), at: Date.now() });
        saveJson(ENC_PATH, db);
        return reply(`✅ *Note #${notes.length} saved (encrypted).*`);
      }
      if (sub === 'list') {
        return reply(notes.length ? `🔒 *Encrypted Notes (${notes.length}):*\n\n${notes.map((n) => `#${n.id} — ${new Date(n.at).toLocaleDateString('en-IN')}`).join('\n')}\n\nRead: \`.encnote get <password> <id>\`` : '🔒 *No notes.*');
      }
      if (sub === 'get') {
        const pass = args[1];
        const id = parseInt(args[2], 10);
        const note = notes.find((n) => n.id === id);
        if (!note) return reply('❌ *Note not found.*');
        try {
          return reply(`🔒 *Note #${id}:*\n\n${aesDecrypt(note.enc, pass)}`);
        } catch (_) {
          return reply('❌ *Wrong password.*');
        }
      }
      return reply('🔒 *Encrypted Notes*\n\n`.encnote add <password> <text>`\n`.encnote list <password>`\n`.encnote get <password> <id>`\n\n⚠️ Password bhool gaye to note kabhi nahi khulega!');
    },
  },
] };
