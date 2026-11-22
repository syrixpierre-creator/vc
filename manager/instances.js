'use strict';
/**
 * QUEEN AKUMA — Multi-session : préparation des dossiers d'instance.
 *
 * Chaque bot vit dans instances/<numéro>/ :
 *   - code (lib/, index.js, settings.js, node_modules, ...) = liens symboliques
 *     vers le code partagé  → une mise à jour du code profite à tous les bots ;
 *   - command/, store-plugins/, assets/ = vrais dossiers remplis de liens par
 *     fichier → un plugin installé ou une image changée par UN bot reste à lui ;
 *   - data/, session/, temp/, baileys_store.json, .env = 100 % propres au bot.
 *
 * Le bot est lancé avec --preserve-symlinks : __dirname vaut alors
 * instances/<numéro>/lib (et pas le vrai lib/), donc tous les chemins
 * path.join(__dirname, '..', 'data') du code pointent vers les données du bot.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INSTANCES = path.join(ROOT, 'instances');

// Jamais liés dans une instance (soit propres au bot, soit propres au manager).
const PRIVATE = new Set([
  'instances', 'manager', 'manager.js', 'bots.json',
  'data', 'session', 'temp', 'tmp', 'baileys_store.json', '.env',
  'eplugins', 'logs', '.git', 'bot.log',
]);
// Dossiers où le bot peut écrire des fichiers : dossier réel + un lien par fichier.
const PER_FILE = new Set(['command', 'store-plugins', 'assets']);

// SQLite / other database files: never shared between bots.
const isDbFile = (name) => /\.(db|sqlite3?)(-wal|-shm|-journal)?$/i.test(name);

function cleanNumber(raw) {
  const d = String(raw || '').replace(/[^0-9]/g, '');
  return d.length >= 10 && d.length <= 15 ? d : null;
}

function instanceDir(number) { return path.join(INSTANCES, number); }

function lexists(p) { try { fs.lstatSync(p); return true; } catch (_) { return false; } }

function link(target, linkPath) {
  if (lexists(linkPath)) return;
  const rel = path.relative(path.dirname(linkPath), target);
  fs.symlinkSync(rel, linkPath);
}

/** Supprime les liens cassés (fichier supprimé du code partagé après une MAJ). */
function pruneBrokenLinks(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    try {
      if (fs.lstatSync(p).isSymbolicLink() && !fs.existsSync(p)) fs.unlinkSync(p);
    } catch (_) {}
  }
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return fallback; }
}

/** Fixe le propriétaire du bot (lu par settings.js via data/identity.json). */
function setOwner(number, owner) {
  const dataDir = path.join(instanceDir(number), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const idFile = path.join(dataDir, 'identity.json');
  const id = readJson(idFile, {});
  id.ownerNumber = owner;
  fs.writeFileSync(idFile, JSON.stringify(id, null, 2));
  fs.writeFileSync(path.join(dataDir, 'owner.json'), JSON.stringify([owner]));
}

/**
 * Crée ou met à jour le dossier d'un bot. Idempotent : appelé à chaque
 * démarrage pour ajouter les nouveaux fichiers de code (après une MAJ).
 */
function ensureInstance(bot) {
  const dir = instanceDir(bot.number);
  const isNew = !fs.existsSync(dir);
  fs.mkdirSync(dir, { recursive: true });

  // Database files (baileys_store.db = mode, settings…) belong to each bot. Older
  // versions linked the shared one: unlink it so each bot gets its own (mode: public).
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (isDbFile(name) && lexists(p) && fs.lstatSync(p).isSymbolicLink()) { try { fs.unlinkSync(p); } catch (_) {} }
  }

  for (const name of fs.readdirSync(ROOT)) {
    if (PRIVATE.has(name) || name.endsWith('.log') || isDbFile(name)) continue;
    const src = path.join(ROOT, name);
    const dst = path.join(dir, name);
    let st; try { st = fs.statSync(src); } catch (_) { continue; }
    if (PER_FILE.has(name) && st.isDirectory()) {
      if (lexists(dst) && fs.lstatSync(dst).isSymbolicLink()) fs.unlinkSync(dst);
      fs.mkdirSync(dst, { recursive: true });
      for (const f of fs.readdirSync(src)) link(path.join(src, f), path.join(dst, f));
      pruneBrokenLinks(dst);
    } else {
      link(src, dst);
    }
  }
  pruneBrokenLinks(dir);

  // Données propres au bot : copie du modèle à la création, puis seulement
  // les fichiers manquants (nouveaux fichiers par défaut après une MAJ).
  const dataSrc = path.join(ROOT, 'data');
  const dataDst = path.join(dir, 'data');
  if (fs.existsSync(dataSrc)) {
    if (!fs.existsSync(dataDst)) fs.cpSync(dataSrc, dataDst, { recursive: true });
    else for (const f of fs.readdirSync(dataSrc)) {
      const d = path.join(dataDst, f);
      if (!lexists(d)) fs.cpSync(path.join(dataSrc, f), d, { recursive: true });
    }
  }
  fs.mkdirSync(dataDst, { recursive: true });
  if (isNew) {
    // Repartir à zéro : pas de stats / compteurs / premium hérités du modèle.
    for (const f of ['start-time.json', 'dashboard.json', 'cloneRent.json']) {
      try { fs.rmSync(path.join(dataDst, f), { force: true }); } catch (_) {}
    }
    fs.writeFileSync(path.join(dataDst, 'premium.json'), '[]');
    fs.writeFileSync(path.join(dataDst, 'warnings.json'), '{}');
    fs.writeFileSync(path.join(dataDst, 'msgcount.json'), JSON.stringify({ groups: {} }, null, 2));
  }

  const storeDst = path.join(dir, 'baileys_store.json');
  if (!fs.existsSync(storeDst)) {
    fs.writeFileSync(storeDst, JSON.stringify({ contacts: {}, chats: {}, botMode: 'public', messages: {} }, null, 2));
  }
  for (const d of ['session', 'temp', 'tmp']) fs.mkdirSync(path.join(dir, d), { recursive: true });

  // Le propriétaire est toujours réécrit au démarrage s'il n'a pas été
  // personnalisé depuis WhatsApp (.setownernumber écrit aussi identity.json).
  const id = readJson(path.join(dataDst, 'identity.json'), {});
  if (isNew || !id.ownerNumber) setOwner(bot.number, bot.owner || bot.number);
  return dir;
}

function hasSession(number) {
  return fs.existsSync(path.join(instanceDir(number), 'session', 'creds.json'));
}

function resetSession(number) {
  const s = path.join(instanceDir(number), 'session');
  fs.rmSync(s, { recursive: true, force: true });
  fs.mkdirSync(s, { recursive: true });
}

function deleteInstance(number) {
  fs.rmSync(instanceDir(number), { recursive: true, force: true });
}

module.exports = {
  ROOT, INSTANCES, cleanNumber, instanceDir, ensureInstance, setOwner,
  hasSession, resetSession, deleteInstance,
};
