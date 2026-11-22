'use strict';
/**
 * QUEEN AKUMA — simple replies (old-version style).
 *
 * While a command runs, every text it sends goes through simplify():
 *  1. decoration is removed (frame lines, "⟮ … ⟯⊷" headers, "Powered by" / "©" footers);
 *  2. a help page (Usage / Examples / Features…) is collapsed like the old QUEEN AKUMA:
 *       📌 *Usage:* .promote @user
 *       ❌ *Invalid option!*  Available options: - on - off
 * Normal results (search results, AI answers, lists…) keep their content.
 * The menu and similar commands are never touched.
 */
const { AsyncLocalStorage } = require('async_hooks');

const als = new AsyncLocalStorage();

function runWithCommand(ctx, fn) {
  return als.run(ctx || {}, fn);
}

const HELP_MARKERS = /(usage|example|exemple|ejemplo|contoh|cara pakai|cara penggunaan|penggunaan|how to use|how it works|\bcommands?\s*:|\bfeatures\s*:|\boptions\s*:|sub-?commands|syntax|\bformat\s*:)/i;
const OPTION_LABEL = /(options|available|categories|category|types?|networks|modes|effects|styles|languages|choices|tipe|daftar|list)\s*:?\s*\*?\s*$/i;
const NO_TOUCH = new Set(['menu', 'allmenu', 'help', 'listcmd', 'list', 'alive', 'repo', 'github', 'owner', 'creator', 'ping', 'settings', 'runtime', 'uptime']);

const DECO_LINE = /^[\s━─═┄┅┈┉╌╍┏┓┗┛╔╗╚╝║┃│┆┇┊┋╭╮╯╰⊷✦✧〔〕『』「」【】◇◆▰▱•·~=_\-*]+$/;
const FOOTER_LINE = /^[\s>_*~]*(⚡\s*)?(powered by|©|made by|created by|bot by|by inconnu boy sensei)\b.*$/i;
const HEADER_LINE = /⟮.*⟯\s*⊷?\s*$/;

function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** "<prefix>cmd" anywhere, or a line that starts with "cmd <args>" (ported packs without prefix). */
function refRegex(names) {
  const alt = names.filter(Boolean).map(esc).join('|');
  return new RegExp('(?:[.!/#](?:' + alt + ')(?![a-z0-9_-]))|(?:^[\\s`*_•\\-▸►]*(?:' + alt + ')\\s+[<\\[(a-z0-9])', 'im');
}

function stripLabel(l) {
  return String(l)
    .replace(/[`*_]/g, '')
    .replace(/^[^\p{L}\p{N}.!/#<\[]+/u, '')
    .replace(/^\s*(usage|example|exemple|contoh|cara pakai|format|syntax)s?\s*[:：]\s*/i, '')
    .replace(/^[^\p{L}\p{N}.!/#<\[]+/u, '')
    .trim();
}

function cutDescription(l) {
  return l.split(/\s+(?:—|–|→|=>|-)\s+/)[0].replace(/\s{2,}.*$/, '').trim();
}

function decorate(text) {
  let inCode = false;
  const out = [];
  for (const raw of String(text).split('\n')) {
    if (/^\s*```/.test(raw)) { inCode = !inCode; out.push(raw); continue; }
    if (inCode) { out.push(raw); continue; }
    const t = raw.trim();
    if (t && (DECO_LINE.test(t) || FOOTER_LINE.test(t) || HEADER_LINE.test(t))) continue;
    out.push(raw.replace(/^[\s║┃│]+/, '').replace(/\s+$/, ''));
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function isHelpPage(text, ctx) {
  if (!ctx || !ctx.cmd || typeof text !== 'string') return false;
  if (NO_TOUCH.has(String(ctx.cmd).toLowerCase()) || /menu$/i.test(ctx.cmd)) return false;
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 4) return false;
  if (!HELP_MARKERS.test(text)) return false;
  const names = [ctx.cmd, ...(ctx.aliases || []), ctx.invoked].filter(Boolean).map((n) => String(n).toLowerCase());
  if (!refRegex(names).test(text)) return false;
  // Mentions many OTHER commands -> it's a menu/list, not a help page.
  const own = new Set(names);
  const others = new Set();
  for (const m of text.matchAll(/(?:^|[\s`(])[.!/#]([a-z][a-z0-9_-]{1,24})\b/gim)) {
    const n = m[1].toLowerCase();
    if (!own.has(n)) others.add(n);
  }
  return others.size < 6;
}

function extractOptions(lines, names) {
  const opts = [];
  const cmdAlt = names.map(esc).join('|');
  const viaCmd = new RegExp('^[.!/#]?(?:' + cmdAlt + ')\\s+([a-z0-9][\\w.+-]{0,24})(?:\\s|$)', 'i');
  let underLabel = false;
  let inExample = false;
  for (const l of lines) {
    const bare = l.replace(/[`*_]/g, '').trim();
    if (/^\W*(examples?|exemples?|contoh|ejemplos?)\b/i.test(bare)) { inExample = true; underLabel = false; continue; }
    if (OPTION_LABEL.test(bare) && bare.length < 40) { underLabel = true; inExample = false; continue; }
    if (/^\W*(usage|cara pakai|syntax|format)\b/i.test(bare)) inExample = false;
    const item = bare.replace(/^[\s•\-▸►·◦●○➤→]+/, '').replace(/^\d+[.)]\s*/, '').trim();
    let m = item.match(viaCmd);
    if (m && !inExample && !/^[<\[(]/.test(m[1])) { opts.push(m[1].toLowerCase()); continue; }
    if (underLabel) {
      const w = cutDescription(item);
      if (/^[a-z0-9][\w+-]{0,24}$/i.test(w)) { opts.push(w.toLowerCase()); continue; }
      if (!item) continue;
      underLabel = false;
    }
  }
  return [...new Set(opts)];
}

function shorten(text, ctx) {
  const prefix = ctx.prefix || '.';
  const name = String(ctx.invoked || ctx.cmd).toLowerCase();
  const names = [...new Set([name, String(ctx.cmd).toLowerCase(), ...(ctx.aliases || []).map((a) => String(a).toLowerCase())])];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const first = stripLabel(lines[0] || '');
  const lead = /^(❌|⚠️|🚫|❗)/.test((lines[0] || '').trim()) && (lines[0] || '').length <= 90 && !HELP_MARKERS.test(lines[0]) ? lines[0].trim() + '\n' : '';

  // on/off toggles -> old "Invalid option" message
  const low = text.toLowerCase();
  if (new RegExp('(?:' + names.map(esc).join('|') + ')\\s+(on|off|enable|disable)\\b', 'i').test(low)
      && /\bon\b/.test(low) && /\boff\b/.test(low)) {
    return '❌ *Invalid option!*\n\nAvailable options:\n- on\n- off';
  }

  // A list of choices -> "Available options"
  const opts = extractOptions(lines, names).filter((o) => !names.includes(o));
  if (opts.length >= 3) {
    const shown = opts.slice(0, 40);
    return `${lead}❌ *Invalid option!*\n\nAvailable options:\n` + shown.map((o) => '- ' + o).join('\n') + (opts.length > shown.length ? `\n- … (+${opts.length - shown.length})` : '');
  }

  // Usage line
  let usage = '';
  const ref = refRegex(names);
  const labelled = lines.find((l) => /usage|cara pakai|syntax|format/i.test(l) && ref.test(l));
  if (labelled) usage = cutDescription(stripLabel(labelled));
  if (!usage) {
    const hit = lines.find((l) => ref.test(l) && !HELP_MARKERS.test(stripLabel(l).replace(ref, '')) && stripLabel(l).length > 0);
    if (hit) usage = cutDescription(stripLabel(hit));
  }
  const fieldUsage = typeof ctx.usage === 'string' ? cutDescription(stripLabel(ctx.usage.split('\n')[0])) : '';
  if (fieldUsage && (!usage || (/[<[]/.test(fieldUsage) && !/[<[]/.test(usage)))) usage = fieldUsage;
  if (!usage || !ref.test(' ' + (/^[.!/#]/.test(usage) ? usage : prefix + usage))) usage = `${name} <text>`;
  if (!/^[.!/#]/.test(usage)) usage = prefix + usage;
  if (usage.length > 160) usage = usage.slice(0, 157) + '…';
  void first;
  return `${lead}📌 *Usage:* ${usage}`;
}

function simplifyText(t, ctx) {
  if (NO_TOUCH.has(String(ctx.cmd || '').toLowerCase()) || /menu$/i.test(ctx.cmd || '')) return t;
  const clean = decorate(t);
  if (isHelpPage(clean, ctx)) return shorten(clean, ctx);
  return clean || t;
}

/**
 * Old QUEEN AKUMA buttons on "Invalid option" replies: one quick-reply button per
 * option (max 3), e.g. .antilink → [ON] [OFF].
 */
const OPT_LABEL = { on: '✅ ON', off: '❌ OFF', enable: '✅ ON', disable: '❌ OFF' };
function optionButtons(text, ctx, content) {
  if (content.buttons || content.edit) return null;
  const t = String(text);
  const m = t.match(/Available options:[ \t]*\n((?:[ \t]*- .+(?:\n|$))+)/);
  let opts;
  if (m) opts = m[1].split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
  else if (/\bon\s*[\/|]\s*off\b/i.test(t) || (/[.!#]\w+ on\b/.test(t) && /[.!#]\w+ off\b/.test(t)) || /specify: on or off/i.test(t)) opts = ['on', 'off'];
  else return null;
  if (!opts.length || opts.length > 3 || opts.some((o) => /…|[<>[\]]/.test(o) || o.length > 20)) return null;
  const name = String(ctx.invoked || ctx.cmd || '').toLowerCase();
  if (!name) return null;
  const p = ctx.prefix || '.';
  return opts.map((o) => {
    const opt = o.split(/\s+/)[0];
    return { buttonId: `${p}${name} ${opt}`, buttonText: { displayText: OPT_LABEL[opt.toLowerCase()] || opt }, type: 1 };
  });
}

/** "> akuma.skyhost.tech" under every command reply (not on .pair: only the code there). */
const SITE = '> akuma.skyhost.tech';
const NO_SITE = new Set(['pair', 'menu']);
function addSite(content, ctx) {
  if (!content || typeof content !== 'object' || content.edit || content.react) return content;
  if (NO_SITE.has(String(ctx.cmd || '').toLowerCase())) return content;
  const key = typeof content.text === 'string' ? 'text' : typeof content.caption === 'string' ? 'caption' : null;
  if (!key || !content[key].trim() || content[key].includes('akuma.skyhost.tech')) return content;
  return { ...content, [key]: content[key].replace(/\s+$/, '') + '\n' + SITE };
}

/** Called by the styled socket for every message sent while a command runs. */
function simplify(content) {
  const ctx = als.getStore();
  if (!ctx || !ctx.cmd) return content;
  return addSite(simplifyInner(content, ctx), ctx);
}
function simplifyInner(content, ctx) {
  try {
    if (!content || typeof content !== 'object') return content;
    if (typeof content.text === 'string' && !content.edit) {
      const t = simplifyText(content.text, ctx);
      const buttons = optionButtons(t, ctx, content);
      if (buttons) return { ...content, text: t, buttons, headerType: 1, footer: 'QUEEN AKUMA' };
      if (t !== content.text) return { ...content, text: t };
    } else if (typeof content.caption === 'string') {
      const t = simplifyText(content.caption, ctx);
      if (t !== content.caption) return { ...content, caption: t };
    }
  } catch (_) {}
  return content;
}

module.exports = { runWithCommand, simplify, simplifyText, isHelpPage, shorten, decorate, als };
