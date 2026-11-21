/**
 * QUEEN AKUMA — Extra command pack (ported from XJX bot): AI chat, logo/ephoto effects,
 * movies, sports, reactions, holy books, media tools, translate, shorturl, etc.
 * Each XJX `execute(sock, msg, args, ctx)` is adapted to QUEEN AKUMA `handler`.
 * Commands/aliases that already exist in QUEEN AKUMA are skipped (no conflicts).
 */
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '_xjx');
let manifest = { files: [], skipAliases: {}, skipNames: [] };
try { manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8')); } catch (_) {}

function getPrefix(ctx) {
  try { return (ctx && ctx.prefix) || require('../lib/prefix').getPrefix(); } catch (_) { return '.'; }
}

const commands = [];
const skipNames = new Set(manifest.skipNames || []);

for (const rel of manifest.files) {
  const fp = path.join(root, 'commands', rel);
  let mod;
  try { mod = require(fp); } catch (e) { console.error('[xjx_pack] skip', rel, '-', e.message); continue; }
  if (mod && mod.default) mod = mod.default;
  if (!Array.isArray(mod)) mod = [mod];
  for (const m of mod) {
    if (!m || !m.name || typeof m.execute !== 'function' || skipNames.has(m.name)) continue;
    const dropAl = new Set((manifest.skipAliases || {})[m.name] || []);
    // Design commands: no "logo" suffix in the name (aqualogo -> aqua). The old
    // name stays as a hidden alias. "gold" already exists (economy) -> "golden".
    let cmdName = String(m.name).toLowerCase();
    const extraAliases = [];
    if ((m.category || '') === 'design' && /logo$/.test(cmdName) && cmdName.length > 4) {
      extraAliases.push(cmdName);
      cmdName = cmdName.slice(0, -4);
      if (cmdName === 'gold') cmdName = 'golden';
    }
    commands.push({
      command: cmdName,
      aliases: [...(m.aliases || []).filter(a => !dropAl.has(a)), ...extraAliases],
      category: m.category || 'tools',
      description: m.description || '',
      async handler(sock, message, args, ctx = {}) {
        const jid = message.key.remoteJid;
        const prefix = getPrefix(ctx);
        // Resolve the command/alias actually typed (some XJX commands share one handler, e.g. league names)
        const raw = String(ctx.rawText || ctx.userMessage || ctx.messageText || '').trim();
        let used = raw.split(/\s+/)[0] || '';
        if (prefix && used.toLowerCase().startsWith(prefix.toLowerCase())) used = used.slice(prefix.length);
        used = (used || m.name).toLowerCase();
        const c = Object.assign({}, ctx, {
          prefix,
          from: jid,
          command: used,
          args: args || [],
          react: (emoji) => sock.sendMessage(jid, { react: { text: emoji, key: message.key } }).catch(() => {}),
          reply: ctx.reply || ((text) => sock.sendMessage(jid, { text: String(text) }, { quoted: message }))
        });
        return m.execute.call(m, sock, message, args || [], c);
      }
    });
  }
}

module.exports = { command: 'xjxpack', category: 'tools', description: 'Extra pack loader', async handler() {}, commands };
