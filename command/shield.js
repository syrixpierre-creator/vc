/*****************************************************************************
 *                                                                           *
 *                QUEEN AKUMA  •  MADE BY INCONNU BOY SENSEI                 *
 *                                                                           *
 *  📢  Channel : INCONNU BOY SENSEI                                         *
 *  🔗  Link    : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J      *
 *                                                                           *
 *****************************************************************************/

/**
 * 🛡️ GROUP SHIELD — all group protections in one plugin.
 *
 *   .shield                      → status panel
 *   .antiforward on|off|delete|warn|kick
 *   .antinewsletter … .antisticker … .antimention … .antistatus … .antivirtex …
 *   .antiphishing … .antitoxic … .antibot … .antiflood …
 *   .antipromote / .antidemote on|off|punish
 *
 * Admins, the owner/sudo and the bot itself are always exempt.
 * The bot must be a group admin to delete / kick.
 */
const db = require('../lib/jsondb');
const isAdmin = require('../lib/isAdmin');
const isOwnerOrSudo = require('../lib/isOwner');
const settings = require('../settings');

const NAME = 'shield';
const WARN_LIMIT = 3;

// canonical feature -> { label, aliases, kind }
const FEATURES = {
  antiforward:     { label: 'Anti-Forward',        aliases: ['noforward', 'antiforwarded'], kind: 'msg' },
  antinewsletter:  { label: 'Anti-Channel-Forward', aliases: ['antichannel'], kind: 'msg' },
  antisticker:     { label: 'Anti-Sticker',        aliases: [], kind: 'msg' },
  antimention:     { label: 'Anti-Mention',        aliases: ['nomention'], kind: 'msg' },
  antistatus:      { label: 'Anti-Status-Mention', aliases: ['antigroupmention', 'antigm', 'antistatusmention', 'antitagsw', 'antigroupstatus'], kind: 'msg' },
  antivirtex:      { label: 'Anti-Virtex',         aliases: ['antivirus', 'anticrash'], kind: 'msg' },
  antiphishing:    { label: 'Anti-Phishing',       aliases: ['antiphising', 'antiscam'], kind: 'msg' },
  antitoxic:       { label: 'Anti-Toxic',          aliases: ['antiabuse'], kind: 'msg' },
  antibot:         { label: 'Anti-Bot',            aliases: ['antibots'], kind: 'msg' },
  antiwords:       { label: 'Anti-Words (custom)', aliases: ['antiword', 'wordfilter', 'badwordfilter'], kind: 'msg' },
  antitagall:      { label: 'Anti-Tag-All',        aliases: ['antieveryone'], kind: 'msg' },
  antiflood:       { label: 'Anti-Flood',          aliases: ['antispam', 'antifloods'], kind: 'msg' },
  antipromote:     { label: 'Anti-Promote',        aliases: [], kind: 'role' },
  antidemote:      { label: 'Anti-Demote',         aliases: ['antiunadmin'], kind: 'role' }
};

const ALIAS_TO_FEATURE = {};
for (const [name, f] of Object.entries(FEATURES)) {
  ALIAS_TO_FEATURE[name] = name;
  f.aliases.forEach(a => { ALIAS_TO_FEATURE[a] = name; });
}
const ALL_NAMES = Object.keys(ALIAS_TO_FEATURE);

//  detection data
const PHISH_BUILTIN = /(free[-._]?(robux|vbucks|diamonds?|fire|gift|money|recharge))|(claim[-._]?(prize|reward|gift))|(whatsapp[-._]?(gold|plus|premium|verify|update))|grabify|iplogger|ipgrabber|2no\.co|leancoding|blasze/i;
const TOXIC_BUILTIN = [
  'fuck', 'fucker', 'motherfucker', 'shit', 'bitch', 'asshole', 'bastard', 'dickhead', 'slut', 'whore',
  'madarchod', 'behenchod', 'bhosdike', 'bhosdi', 'chutiya', 'chutiye', 'gandu', 'randi', 'harami', 'kutte', 'saala kutta'
];
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;

const flood = new Map(); // chat|user -> [timestamps]

//  helpers
const num = (j) => String(j || '').split(':')[0].split('@')[0];
const jidOf = (p) => (typeof p === 'string' ? p : (p?.id || p?.phoneNumber || ''));

function groupData(chatId) {
  const all = db.load(NAME, {});
  if (!all[chatId]) all[chatId] = { features: {}, warns: {}, phish: [], toxic: [], words: [], tagLimit: 8, flood: { limit: 6, window: 8 } };
  const g = all[chatId];
  g.words = g.words || []; g.tagLimit = g.tagLimit || 8;
  g.features = g.features || {}; g.warns = g.warns || {}; g.phish = g.phish || []; g.toxic = g.toxic || [];
  g.flood = g.flood || { limit: 6, window: 8 };
  return g;
}
const save = () => db.save(NAME);

function unwrap(msg) {
  if (!msg) return {};
  let m = msg;
  for (let i = 0; i < 4; i++) {
    m = m.ephemeralMessage?.message || m.viewOnceMessage?.message || m.viewOnceMessageV2?.message ||
        m.documentWithCaptionMessage?.message || m.editedMessage?.message?.protocolMessage?.editedMessage || m;
  }
  const mtype = Object.keys(m).find(k => k !== 'messageContextInfo' && k !== 'senderKeyDistributionMessage') || '';
  const body = m[mtype];
  const text = typeof body === 'string' ? body
    : (body?.text || body?.caption || body?.conversation || m.conversation || '');
  return { m, mtype, body, text: String(text || ''), ci: body?.contextInfo };
}

function normalizeWords(t) {
  return ' ' + t.toLowerCase().replace(/[@4]/g, 'a').replace(/[1!|]/g, 'i').replace(/0/g, 'o').replace(/\$/g, 's')
    .replace(/[^a-z\u0900-\u097F\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
}

/** returns reason string or null */
function inspect(g, message, info, sender, chatId) {
  const f = g.features;
  const on = (k) => f[k]?.on;
  const { m, mtype, text, ci } = info;

  if (on('antiforward') && (ci?.isForwarded || Number(ci?.forwardingScore || 0) > 0)) return { feature: 'antiforward', why: 'forwarded message' };
  if (on('antinewsletter') && ci?.forwardedNewsletterMessageInfo) return { feature: 'antinewsletter', why: 'channel forward' };
  if (on('antisticker') && mtype === 'stickerMessage') return { feature: 'antisticker', why: 'sticker' };
  if (on('antistatus') && (/groupStatusMention|statusMention/i.test(mtype) || m.groupStatusMentionMessage || m.statusMentionMessage)) {
    return { feature: 'antistatus', why: 'status mention' };
  }
  if (on('antimention') && Array.isArray(ci?.mentionedJid) && ci.mentionedJid.length > 0) return { feature: 'antimention', why: 'member tag' };
  if (on('antitagall')) {
    const limit = g.tagLimit || 8;
    if ((ci?.mentionedJid?.length || 0) >= limit || (ci?.groupMentions?.length || 0) > 0 || /@(everyone|all)\b/i.test(text)) {
      return { feature: 'antitagall', why: 'mass tagging' };
    }
  }
  if (on('antibot')) {
    const id = String(message.key.id || '');
    if (id.startsWith('BAE5') && id.length === 16) return { feature: 'antibot', why: 'bot message' };
  }
  if (text) {
    if (on('antivirtex')) {
      const inv = (text.match(INVISIBLE) || []).length;
      if (text.length > 4000 || /(.)\1{30,}/s.test(text) || inv > 40) return { feature: 'antivirtex', why: 'virtex / crash text' };
    }
    if (on('antiphishing')) {
      const low = text.toLowerCase();
      if ((/https?:\/\/|www\./i.test(text) && PHISH_BUILTIN.test(low)) || g.phish.some(p => low.includes(p))) {
        return { feature: 'antiphishing', why: 'phishing link' };
      }
    }
    if (on('antiwords') && g.words.length) {
      const norm = normalizeWords(text);
      if (g.words.some(w => norm.includes(' ' + w.toLowerCase() + ' '))) return { feature: 'antiwords', why: 'banned word' };
    }
    if (on('antitoxic')) {
      const norm = normalizeWords(text);
      const words = [...TOXIC_BUILTIN, ...g.toxic];
      if (words.some(w => norm.includes(' ' + w.toLowerCase() + ' ') || norm.includes(' ' + w.toLowerCase() + 's '))) {
        return { feature: 'antitoxic', why: 'abusive language' };
      }
    }
  }
  if (on('antiflood')) {
    const key = chatId + '|' + sender;
    const now = Date.now();
    const win = (g.flood.window || 8) * 1000;
    const arr = (flood.get(key) || []).filter(t => now - t < win);
    arr.push(now);
    flood.set(key, arr);
    if (arr.length >= (g.flood.limit || 6)) { flood.delete(key); return { feature: 'antiflood', why: 'flooding' }; }
    if (flood.size > 2000) flood.clear();
  }
  return null;
}

async function punish(sock, chatId, message, sender, hit, g) {
  const action = g.features[hit.feature]?.action || 'delete';
  try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}

  if (action === 'kick') {
    try {
      await sock.groupParticipantsUpdate(chatId, [message.key.participant || sender], 'remove');
      await sock.sendMessage(chatId, { text: `🚫 @${num(sender)} removed — *${hit.why}* is not allowed here.`, mentions: [sender] });
    } catch (e) { console.error('[shield] kick failed:', e.message); }
    return;
  }
  if (action === 'warn') {
    const k = num(sender);
    g.warns[k] = (g.warns[k] || 0) + 1;
    const n = g.warns[k];
    if (n >= WARN_LIMIT) {
      delete g.warns[k]; save();
      try {
        await sock.groupParticipantsUpdate(chatId, [message.key.participant || sender], 'remove');
        await sock.sendMessage(chatId, { text: `🚫 @${k} removed after ${WARN_LIMIT} warnings (*${hit.why}*).`, mentions: [sender] });
      } catch (e) { console.error('[shield] kick failed:', e.message); }
    } else {
      save();
      await sock.sendMessage(chatId, { text: `⚠️ @${k} warning *${n}/${WARN_LIMIT}* — ${hit.why} is not allowed.`, mentions: [sender] });
    }
  }
  // action === 'delete' → silent delete
}

//  command
function statusText(g, prefix) {
  const rows = Object.entries(FEATURES).map(([k, f]) => {
    const c = g.features[k];
    const st = c?.on ? `✅ ${f.kind === 'role' ? (c.action === 'punish' ? 'punish' : 'revert') : (c.action || 'delete')}` : '❌ off';
    return ` ${f.label.padEnd(20)} ${st}`;
  });
  return ` 🛡️ *GROUP SHIELD* \n${rows.join('\n')}\n\n` +
    ` Flood: ${g.flood.limit} msgs / ${g.flood.window}s\n\n\n` +
    `*Usage*\n${prefix}antiforward on | off | warn | kick\n${prefix}antiflood limit 6 | window 8\n` +
    `${prefix}antiphishing add <word/link> | del | list\n${prefix}antitoxic add <word> | del | list\n${prefix}antiwords add <word> | del | list\n${prefix}antitagall limit 8\n` +
    `${prefix}antidemote on | off | punish\n\n_Admins & owner are exempt • bot must be admin_`;
}

function invoked(ctx = {}) {
  let t = String(ctx.userMessage || ctx.rawText || '').trim();
  for (const p of settings.prefixes) if (t.startsWith(p)) { t = t.slice(p.length); break; }
  return (t.split(/\s+/)[0] || '').toLowerCase();
}

module.exports = {
  command: 'shield',
  aliases: ['protect', 'groupshield', ...ALL_NAMES],
  category: 'admin',
  description: 'Group protections: anti-forward/sticker/flood/virtex/phishing/toxic/bot/promote/demote…',
  usage: '.shield | .antiforward on | .antiflood limit 6 | .antidemote on',
  groupOnly: true,
  adminOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const prefix = settings.prefixes[0];
    const reply = (t) => sock.sendMessage(chatId, { text: t, mentions: [] }, { quoted: message });
    const g = groupData(chatId);

    let name = invoked(context);
    let rest = args;
    if (!ALIAS_TO_FEATURE[name]) {                // .shield <feature> ...
      name = (args[0] || '').toLowerCase();
      rest = args.slice(1);
    }
    const feature = ALIAS_TO_FEATURE[name];
    if (!feature) return reply(statusText(g, prefix));

    const f = FEATURES[feature];
    const sub = (rest[0] || '').toLowerCase();
    const cur = g.features[feature] || { on: false, action: f.kind === 'role' ? 'revert' : 'delete' };

    // custom lists
    if (['antiphishing', 'antitoxic', 'antiwords'].includes(feature) && ['add', 'del', 'remove', 'list'].includes(sub)) {
      const list = feature === 'antiphishing' ? g.phish : (feature === 'antiwords' ? g.words : g.toxic);
      const val = rest.slice(1).join(' ').trim().toLowerCase();
      if (sub === 'list') return reply(list.length ? `📋 *${f.label} custom list*\n` + list.map((x, i) => `${i + 1}. ${x}`).join('\n') : 'Custom list is empty.');
      if (!val) return reply(`Usage: ${prefix}${feature} ${sub} <word>`);
      if (sub === 'add') { if (!list.includes(val)) list.push(val); save(); return reply(`✅ Added: ${val}`); }
      const i = list.indexOf(val);
      if (i === -1) return reply('❌ Not in list.');
      list.splice(i, 1); save(); return reply(`🗑️ Removed: ${val}`);
    }

    // flood tuning
    if (feature === 'antiflood' && (sub === 'limit' || sub === 'window')) {
      const v = parseInt(rest[1], 10);
      if (!v || v < 2 || v > 60) return reply(`Usage: ${prefix}antiflood ${sub} <2-60>`);
      g.flood[sub] = v; save();
      return reply(`✅ Anti-Flood: ${g.flood.limit} messages / ${g.flood.window}s`);
    }

    if (feature === 'antitagall' && sub === 'limit') {
      const v = parseInt(rest[1], 10);
      if (!v || v < 2 || v > 100) return reply(`Usage: ${prefix}antitagall limit <2-100>`);
      g.tagLimit = v; save();
      return reply(`✅ Anti-Tag-All: messages tagging ${v}+ members are blocked`);
    }

    if (!sub || sub === 'status') {
      return reply(`🛡️ *${f.label}:* ${cur.on ? 'ON' : 'OFF'}${f.kind === 'msg' && cur.on ? ` (${cur.action || 'delete'})` : ''}\n\n` +
        `${prefix}${feature} on | off${f.kind === 'msg' ? ' | warn | kick' : ' | punish'}`);
    }

    const MODES = f.kind === 'role' ? ['on', 'off', 'revert', 'punish'] : ['on', 'off', 'delete', 'warn', 'kick', 'null'];
    if (!MODES.includes(sub)) return reply(`❌ Use: ${MODES.join(' / ')}`);

    if (sub === 'off') g.features[feature] = { ...cur, on: false };
    else {
      const action = (sub === 'on' || sub === 'null') ? (cur.action || (f.kind === 'role' ? 'revert' : 'delete'))
        : (sub === 'revert' ? 'revert' : sub);
      g.features[feature] = { on: true, action };
    }
    save();

    let warn = '';
    try {
      const { isBotAdmin } = await isAdmin(sock, chatId, sock.user?.id || '');
      if (sub !== 'off' && !isBotAdmin) warn = '\n\n⚠️ Make the bot a *group admin* or it cannot delete/kick.';
    } catch {}
    const st = g.features[feature];
    return reply(`🛡️ *${f.label}* is now *${st.on ? 'ON' : 'OFF'}*${st.on ? ` (${st.action})` : ''}${warn}`);
  },

  //  per-message enforcement
  async onMessage(sock, message, ctx) {
    if (!ctx.isGroup || message.key.fromMe) return;
    const all = db.load(NAME, {});
    const g = all[ctx.chatId];
    if (!g) return;
    const f = g.features;
    if (!Object.keys(f).some(k => FEATURES[k]?.kind === 'msg' && f[k]?.on)) return;

    const info = unwrap(message.message);
    if (!info.mtype || info.mtype === 'protocolMessage') return;
    const sender = message.key.participant || ctx.senderId;

    const hit = inspect(g, message, info, sender, ctx.chatId);
    if (!hit) return;

    // exemptions: owner/sudo, admins
    try {
      if (await isOwnerOrSudo(sender, sock, ctx.chatId)) return;
      const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, ctx.chatId, sender);
      if (isSenderAdmin || !isBotAdmin) return;
    } catch { return; }

    await punish(sock, ctx.chatId, message, sender, hit, g);
  },

  //  other bots' messages (ids BAE5…) are filtered out before commands, so Anti-Bot hooks here
  async onBotMessage(sock, message) {
    const chatId = message.key.remoteJid;
    const g = db.load(NAME, {})[chatId];
    if (!g?.features?.antibot?.on) return;
    const sender = message.key.participant;
    try {
      if (!sender || await isOwnerOrSudo(sender, sock, chatId)) return;
      const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, sender);
      if (isSenderAdmin || !isBotAdmin) return;
    } catch { return; }
    await punish(sock, chatId, message, sender, { feature: 'antibot', why: 'bot message' }, g);
  },

  //  anti promote / demote
  async onGroupUpdate(sock, update) {
    const { id, participants, action, author } = update || {};
    if (action !== 'promote' && action !== 'demote') return;
    const g = db.load(NAME, {})[id];
    if (!g) return;
    const feat = action === 'promote' ? 'antipromote' : 'antidemote';
    const cfg = g.features[feat];
    if (!cfg?.on || !author) return;

    const botNum = num(sock.user?.id);
    if (num(author) === botNum) return;

    let meta;
    try { meta = await sock.groupMetadata(id); } catch { return; }
    if (meta.owner && num(meta.owner) === num(author)) return;
    try { if (await isOwnerOrSudo(author, sock, id)) return; } catch {}

    const { isBotAdmin } = await isAdmin(sock, id, sock.user?.id || '');
    if (!isBotAdmin) return;

    const victims = (participants || []).map(jidOf).filter(j => j && num(j) !== botNum && !(meta.owner && num(meta.owner) === num(j)));
    if (!victims.length) return;

    try {
      if (action === 'demote') await sock.groupParticipantsUpdate(id, victims, 'promote');   // give admin back
      else await sock.groupParticipantsUpdate(id, victims, 'demote');                          // undo promotion
      if (cfg.action === 'punish') await sock.groupParticipantsUpdate(id, [author], 'demote');
      await sock.sendMessage(id, {
        text: `🛡️ *${FEATURES[feat].label}* — @${num(author)} tried to ${action} ${victims.map(v => '@' + num(v)).join(', ')}. ` +
          `${action === 'demote' ? 'Admin restored' : 'Promotion reverted'}${cfg.action === 'punish' ? ' and the author was demoted' : ''}.`,
        mentions: [author, ...victims]
      });
    } catch (e) { console.error('[shield] role guard failed:', e.message); }
  }
};
