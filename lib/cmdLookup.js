'use strict';
/**
 * QUEEN AKUMA v3.5.0 — command lookup helper (Batch D).
 * Text-scan karta hai command/ dir ko (require nahi karta poora dir — fast + safe).
 * .findcmd, .retry, .getcase, .allcmd iska use karte hain.
 */
const fs = require('fs');
const path = require('path');
const CMD_DIR = path.join(__dirname, '..', 'command');

function scanCommands() {
  const out = [];
  let files = [];
  try { files = fs.readdirSync(CMD_DIR).filter((f) => f.endsWith('.js')); } catch (e) { return out; }
  for (const f of files) {
    let src = '';
    try { src = fs.readFileSync(path.join(CMD_DIR, f), 'utf8'); } catch (e) { continue; }
    const names = [...src.matchAll(/command\s*:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    const aliasBlocks = [...src.matchAll(/aliases\s*:\s*\[([^\]]*)\]/g)]
      .map((m) => [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]));
    names.forEach((name, i) => {
      out.push({ name, aliases: aliasBlocks[i] || [], file: f });
    });
  }
  return out;
}

function findCommand(name) {
  const n = String(name || '').toLowerCase().replace(/^\./, '').trim();
  if (!n) return null;
  const all = scanCommands();
  return all.find((e) => e.name.toLowerCase() === n || (e.aliases || []).some((a) => a.toLowerCase() === n)) || null;
}

// Sirf owning file require karo, entry nikalo.
function loadEntry(name) {
  const found = findCommand(name);
  if (!found) return null;
  let mod = null;
  try { mod = require(path.join(CMD_DIR, found.file)); } catch (e) { return { found, error: String(e.message || e) }; }
  const list = mod.commands || (mod.command ? [{ command: mod.command, aliases: mod.aliases || [], handler: mod.handler }] : []);
  const entry = list.find((c) => c.command === found.name || (c.aliases || []).includes(found.name)) || list[0];
  return { found, mod, entry };
}

module.exports = { scanCommands, findCommand, loadEntry, CMD_DIR };
