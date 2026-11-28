'use strict';
/**
 * QUEEN AKUMA — sensitive commands: owner (and sudo) only.
 * Enforced centrally in lib/messageHandler.js before any handler runs, so no
 * command (native or legacy) can skip it.
 */

// Every command in these categories is owner-only.
const OWNER_CATEGORIES = new Set(['owner', 'admin', 'privacy', 'panel', 'settings', 'system', 'bug']);

// Sensitive commands in other categories (by primary command name).
const OWNER_COMMANDS = new Set([
  // group management
  'add', 'memberadd', 'kick', 'kicklegacy', 'tkick', 'softban', 'ban', 'promote', 'demote', 'makeadmin', 'dismiss',
  'mute', 'unmute', 'automute', 'opengc', 'closetime', 'opentime', 'glock', 'onlyadmin', 'slowmode',
  'setname', 'setdesc', 'updategdesc', 'gcpp', 'fullgpp', 'setbye', 'setintro', 'setschedule', 'delschedule',
  'invitelink', 'linkgc', 'linkgrup', 'joinrequests', 'backupgroup', 'vcfgen', 'unpin', 'pinpesan', 'post',
  'hidetag', 'hidetagx', 'tag', 'totag', 'tagadmins', 'tagsw', 'spamtag', 'pdm', 'resetwarn', 'warnlimit',
  'filter', 'aimod', 'ammode', 'auditlog',
  // group protections (toggles)
  'antiaction', 'antiaudio', 'antibot', 'antibug', 'anticontact', 'anticountry', 'antidoc', 'antiedit',
  'antiforward', 'antigm', 'antiimage', 'antilink', 'antilinkfb', 'antilinkx', 'antilocation', 'antimedia',
  'antimention', 'antipoll', 'antiporn', 'antispam', 'antispamalt', 'antisticker', 'antistickerwarn',
  'antisystem', 'antitag', 'antivideo', 'antivoice', 'antivv', 'antiword',
  // dangerous tools
  'otpbomb', 'spamotp', 'spamwa', 'jadibot', 'plugininstall', 'coderun', 'unlockcmd', 'newantispam',
  'newantigsmsdelete', 'self', 'kudetagc', 'setattr', 'setmentionreply', 'uploadgh', 'upch', 'playch',
  'rch2', 'reactch', 'wareact', 'channelreact', 'chreact', 'creact', 'setvv',
]);

function isSensitive(cmd, invokedName) {
  if (!cmd) return false;
  const cat = String(cmd.category || '').toLowerCase();
  if (OWNER_CATEGORIES.has(cat)) return true;
  const name = String(cmd.command || '').toLowerCase();
  return OWNER_COMMANDS.has(name) || OWNER_COMMANDS.has(String(invokedName || '').toLowerCase());
}

const DENY_TEXT = '🚫 *You are not authorized to use this command!*';

// SERVER commands: they act on the whole server (code, shell, files of every
// session, pm2, updates). Each session owner is only the owner of HIS bot (like
// INCONNU XD), so these are reserved to the developer (DEV_NUMBERS in .env).
const DEV_COMMANDS = new Set([
  'eval', 'ev', 'exec', 'shell', 'runjs', '$', '>', '=>', 'crun', 'cpp', 'runcpp', 'c++', 'coderun',
  'plugininstall', 'savefile', 'savefileplugins', 'zip', 'botzip', 'zipbot', 'fullbackup', 'backupall',
  'update', 'updatenow', 'shutdown', 'dyno', 'pm2', 'jadibot', 'gitpull',
]);
// Restart = only THIS session (handled in messageHandler), never the server.
const SESSION_RESTART = new Set(['restart', 'reboot', 'rbt', 'selfrestart']);

function digits(v) { return String(v || '').split('@')[0].split(':')[0].replace(/\D/g, ''); }
function devNumbers() {
  return String(process.env.DEV_NUMBERS || '554488138425').split(/[,\s]+/).map(digits).filter(Boolean);
}
function isDevCommand(cmd, invokedName) {
  const names = [cmd && cmd.command, cmd && cmd.name, invokedName].map((x) => String(x || '').toLowerCase().replace(/^[.!/#]/, ''));
  return names.some((n) => DEV_COMMANDS.has(n));
}
function isSessionRestart(invokedName) {
  return SESSION_RESTART.has(String(invokedName || '').toLowerCase().replace(/^[.!/#]/, ''));
}
/** sender = real sender JID (PN or LID resolved); botId = sock.user.id */
function isDev(sender, fromMe, botId) {
  const devs = devNumbers();
  const who = fromMe ? digits(botId) : digits(sender);
  return !!who && devs.includes(who);
}
const DEV_DENY_TEXT = '🔒 *Commande serveur réservée au développeur.*';

module.exports = { isSensitive, DENY_TEXT, OWNER_CATEGORIES, OWNER_COMMANDS,
  isDevCommand, isDev, isSessionRestart, DEV_DENY_TEXT, DEV_COMMANDS };
