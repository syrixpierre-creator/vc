/*****************************************************************************
 * QUEEN AKUMA — .dexapi
 * Owner: full API test / add / change / status
 * Non-owner: must say "papa" then password, then limited use window
 *****************************************************************************/
const settings = require('../settings');
const apiReg = require('../lib/apiRegistry');
const isOwnerFn = require('../lib/isOwner');

// jid -> { step: 'papa'|'password'|'ok', until }
const gate = new Map();
const SESSION_MS = 10 * 60 * 1000;

function dig(v) {
  return String(v || '').replace(/\D/g, '');
}
function isOwnerMsg(m, sock) {
  if (m.key.fromMe) return true;
  const sender = m.key.participant || m.key.remoteJid;
  if (isOwnerFn.isOwnerOnly && isOwnerFn.isOwnerOnly(sender)) return true;
  if (dig(sender) && dig(settings.ownerNumber) && dig(sender).includes(dig(settings.ownerNumber))) return true;
  return false;
}

function helpText() {
  return (
    ` *DEX API* \n` +
    ` Owner API manager\n` +
    `\n\n` +
    `*Status / Test*\n` +
    `• \`.dexapi status\` — saari API list + last config\n` +
    `• \`.dexapi test\` — saari templates test\n` +
    `• \`.dexapi test <name>\` — ek API test\n\n` +
    `*Manage*\n` +
    `• \`.dexapi list\`\n` +
    `• \`.dexapi show <name>\`\n` +
    `• \`.dexapi add <name> <url>\`\n` +
    `  example: \`.dexapi add mysong https://api.example.com/yt?q={query}&key={key}\`\n` +
    `• \`.dexapi set <name> <url>\` — replace URL\n` +
    `• \`.dexapi del <name>\`\n` +
    `• \`.dexapi pass <newpass>\` — gate password (owner)\n\n` +
    `*Templates:* download, song, play, info, lookup, github, onlineinfo, tiktok, facebook\n\n` +
    `_Non-owner: pehle "papa" bolo, phir password, phir 10 min use._`
  );
}

async function ensureGate(sock, m, chatId, sender, owner) {
  if (owner) return true;
  const k = dig(sender) || sender;
  const g = gate.get(k);
  const now = Date.now();
  if (g && g.step === 'ok' && g.until > now) return true;

  // listen for papa / password in args joined as text flow via subcommands
  return false;
}

module.exports = {
  command: 'dexapi',
  aliases: ['api', 'apis', 'testapi'],
  category: 'owner',
  description: 'Test / manage bot APIs (owner; others need papa+password)',
  usage: '.dexapi status|test|list|add|set|del|pass',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    const owner = isOwnerMsg(message, sock);
    const sub = String(args[0] || '').toLowerCase();
    const rest = args.slice(1);
    const k = dig(sender) || String(sender);

    // Non-owner gate
    if (!owner) {
      let g = gate.get(k) || { step: 'papa', until: 0 };
      if (g.step === 'ok' && g.until > Date.now()) {
        // allowed
      } else if (!sub || sub === 'help') {
        return sock.sendMessage(chatId, {
          text: '🔒 *DEX API* protected\n\nPehle chat me likho: *papa*\nPhir \`.dexapi\` dubara, password maanga jayega.'
        }, { quoted: message });
      } else if (sub === 'papa' || String(args[0] || '').toLowerCase() === 'papa') {
        gate.set(k, { step: 'password', until: 0 });
        return sock.sendMessage(chatId, {
          text: '🫡 Papa sun liya.\nAb password bhejo:\n`.dexapi auth <password>`'
        }, { quoted: message });
      } else if (sub === 'auth') {
        const pw = rest.join(' ').trim();
        if (pw && pw === apiReg.getPassword()) {
          gate.set(k, { step: 'ok', until: Date.now() + SESSION_MS });
          return sock.sendMessage(chatId, {
            text: '✅ Access 10 min ke liye open.\nAb `.dexapi status` / `.dexapi test` use karo.'
          }, { quoted: message });
        }
        return sock.sendMessage(chatId, { text: '❌ Galat password. Pehle *papa* flow dobara.' }, { quoted: message });
      } else {
        // if they typed papa as free text via .dexapi papa
        if (g.step === 'password') {
          return sock.sendMessage(chatId, { text: '🔑 Password: `.dexapi auth <password>`' }, { quoted: message });
        }
        return sock.sendMessage(chatId, {
          text: '🌚 Pehle *papa* bolo:\n`.dexapi papa`\nPhir password.'
        }, { quoted: message });
      }
    }

    if (!sub || sub === 'help') {
      return sock.sendMessage(chatId, { text: helpText() }, { quoted: message });
    }

    if (sub === 'papa') {
      return sock.sendMessage(chatId, { text: '👑 Owner ho — seedha `.dexapi status` use karo.' }, { quoted: message });
    }

    if (sub === 'pass' || sub === 'password') {
      if (!owner) {
        return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
      }
      const pw = rest.join(' ').trim();
      if (!pw) return sock.sendMessage(chatId, { text: 'Usage: `.dexapi pass newpassword`' }, { quoted: message });
      apiReg.setPassword(pw);
      return sock.sendMessage(chatId, { text: '✅ DEX API password update.' }, { quoted: message });
    }


    if (sub === 'cat' || sub === 'category' || sub === 'categories') {
      const cats = apiReg.listCategories();
      const lines = Object.keys(cats).sort().map((c) => {
        return '📂 *' + c + '* (' + cats[c].length + ')\n' + cats[c].map((n) => '  • ' + n).join('\n');
      });
      return sock.sendMessage(chatId, {
        text: '📡 *API CATEGORIES*\n\n' + lines.join('\n\n')
      }, { quoted: message });
    }

if (sub === 'list' || sub === 'status') {
      let text = apiReg.formatStatus();
      if (text.length > 3500) {
        const all = apiReg.listAll();
        const names = Object.keys(all).sort();
        const half = Math.ceil(names.length / 2);
        const fmt = (arr, start) => arr.map((name, i) => {
          const x = all[name];
          return '*' + (start + i + 1) + '. ' + name + '*\n📌 ' + (x.purpose || '-') +
            '\n📄 `' + (x.file || '-') + '`\n🔗 ' + String(x.url || '').slice(0, 100);
        }).join('\n\n');
        await sock.sendMessage(chatId, {
          text: '📡 *DEX API STATUS* (1/2)\nTotal: *' + names.length + '*\n\n' + fmt(names.slice(0, half), 0)
        }, { quoted: message });
        await sock.sendMessage(chatId, {
          text: '📡 *DEX API STATUS* (2/2)\n\n' + fmt(names.slice(half), half) +
            '\n\nTest: `.dexapi test` | `.dexapi show <name>`'
        }, { quoted: message });
        return;
      }
      return sock.sendMessage(chatId, { text }, { quoted: message });
    }

    if (sub === 'show') {
      const name = String(rest[0] || '').toLowerCase();
      const all = apiReg.listAll();
      if (!name || !all[name]) {
        return sock.sendMessage(chatId, { text: '❌ `.dexapi show <name>`' }, { quoted: message });
      }
      const t = all[name];
      return sock.sendMessage(chatId, {
        text:
          '*' + name + '*\n' +
          '📌 Purpose: ' + (t.purpose || t.label || '-') + '\n' +
          '📄 File: `' + (t.file || '-') + '`\n' +
          'Method: ' + (t.method || 'GET') + '\n' +
          '🔗 URL:\n' + t.url + '\n' +
          'Key env: ' + (t.keyEnv || '-')
      }, { quoted: message });
    }

    if (sub === 'test') {
      const name = String(rest[0] || '').toLowerCase();
      await sock.sendMessage(chatId, { text: '⏳ API test chal raha hai…' }, { quoted: message });
      if (name) {
        const r = await apiReg.testEndpoint(name);
        const body =
          `*TEST:* ${r.name}\n` +
          `Status: ${r.ok ? '✅ OK' : '❌ FAIL'}\n` +
          (r.status != null ? `HTTP: ${r.status}\n` : '') +
          (r.ms != null ? `Time: ${r.ms}ms\n` : '') +
          (r.error ? `Error: ${r.error}\n` : '') +
          (r.preview ? `Preview: ${r.preview}\n` : '') +
          (r.url ? `URL: ${r.url.slice(0, 120)}` : '');
        return sock.sendMessage(chatId, { text: body }, { quoted: message });
      }
      const results = await apiReg.testAll();
      const lines = results.map(
        (r) => `${r.ok ? '✅' : '❌'} *${r.name}* ${r.status || r.error || ''} (${r.ms || 0}ms)`
      );
      const ok = results.filter((r) => r.ok).length;
      return sock.sendMessage(chatId, {
        text: `📡 *API TEST ALL*\nOK: *${ok}/${results.length}*\n\n${lines.join('\n')}`
      }, { quoted: message });
    }


    if (sub === 'base') {
      if (!owner) return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
      const url = rest.join(' ').trim();
      if (!url) {
        const rt = apiReg.getRuntimeConfig();
        return sock.sendMessage(chatId, { text: `Current base:\n\`${rt.base}\`\n\nSet: \`.dexapi base https://api.example.com\`` }, { quoted: message });
      }
      apiReg.setBaseAndKey(url, null);
      return sock.sendMessage(chatId, { text: `✅ API base set:\n\`${url}\`\n_Download/play/song ab isi host ko prefer karenge._` }, { quoted: message });
    }

    if (sub === 'key' || sub === 'apikey') {
      if (!owner) return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
      const k = rest.join(' ').trim();
      if (!k) {
        const rt = apiReg.getRuntimeConfig();
        return sock.sendMessage(chatId, { text: `Key set: *${rt.key ? 'yes' : 'no'}*\nSet: \`.dexapi key your-key\`` }, { quoted: message });
      }
      apiReg.setBaseAndKey(null, k);
      return sock.sendMessage(chatId, { text: '✅ Global API key saved (runtime + data/api-registry.json).' }, { quoted: message });
    }

    if (sub === 'enable' || sub === 'disable') {
      if (!owner) return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
      const name = String(rest[0] || '').toLowerCase();
      if (!name) return sock.sendMessage(chatId, { text: `Usage: \`.dexapi ${sub} <name>\`` }, { quoted: message });
      const ok = apiReg.enableApi(name, sub === 'enable');
      return sock.sendMessage(chatId, { text: ok ? `✅ *${name}* ${sub}d` : '❌ API not found' }, { quoted: message });
    }

    if (sub === 'use' || sub === 'call' || sub === 'run') {
      const name = String(rest[0] || '').toLowerCase();
      const q = rest.slice(1).join(' ').trim();
      if (!name) {
        return sock.sendMessage(chatId, { text: 'Usage: `.dexapi use song despacito`\n`.dexapi use tiktok <url>`' }, { quoted: message });
      }
      await sock.sendMessage(chatId, { text: `⏳ Calling *${name}*…` }, { quoted: message }).catch(() => {});
      const vars = {};
      if (/^https?:\/\//i.test(q)) vars.url = q;
      else { vars.query = q; vars.q = q; vars.user = q; vars.ip = q; }
      const r = await (apiReg.fetchNamedFast || apiReg.fetchNamed)(name, vars, { slowMs: 8000, timeoutMs: 20000 });
      if (!r.ok) {
        return sock.sendMessage(chatId, { text: `❌ *${name}*\n${r.error || r.status}\n${r.url || ''}` }, { quoted: message });
      }
      let preview = '';
      try {
        preview = typeof r.data === 'string' ? r.data.slice(0, 1500) : JSON.stringify(r.data, null, 2).slice(0, 1500);
      } catch { preview = String(r.data).slice(0, 500); }
      return sock.sendMessage(chatId, {
        text: `✅ *${name}* HTTP ${r.status}\n\`${r.url}\`\n\n\`\`\`\n${preview}\n\`\`\``
      }, { quoted: message });
    }


    if (sub === 'add' || sub === 'set') {
      if (!owner && !(gate.get(k) && gate.get(k).step === 'ok' && gate.get(k).until > Date.now())) {
        return sock.sendMessage(chatId, { text: '❌ Add/set ke liye owner ya unlocked session.' }, { quoted: message });
      }
      const name = String(rest[0] || '').toLowerCase();
      const url = rest.slice(1).join(' ').trim();
      if (!name || !url) {
        return sock.sendMessage(chatId, {
          text: 'Usage:\n`.dexapi add <name> <url>`\nPlaceholders: `{query}` `{url}` `{key}` `{user}` `{ip}`'
        }, { quoted: message });
      }
      apiReg.setTemplate(name, {
        label: name,
        method: 'GET',
        url,
        keyEnv: 'DEMON_API_KEY',
        sample: { query: 'test', url: 'https://example.com', user: 'github', ip: '8.8.8.8' }
      });
      return sock.sendMessage(chatId, { text: `✅ API *${name}* save.\nTest: \`.dexapi test ${name}\`` }, { quoted: message });
    }

    if (sub === 'del' || sub === 'rm' || sub === 'delete') {
      if (!owner) {
        return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
      }
      const name = String(rest[0] || '').toLowerCase();
      if (!name) return sock.sendMessage(chatId, { text: '`.dexapi del <name>`' }, { quoted: message });
      const ok = apiReg.removeTemplate(name);
      return sock.sendMessage(chatId, { text: ok ? `✅ *${name}* removed/disabled` : '❌ Not found' }, { quoted: message });
    }

    return sock.sendMessage(chatId, { text: helpText() }, { quoted: message });
  }
};
