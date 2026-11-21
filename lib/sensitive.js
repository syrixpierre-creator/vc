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

module.exports = { isSensitive, DENY_TEXT, OWNER_CATEGORIES, OWNER_COMMANDS };
