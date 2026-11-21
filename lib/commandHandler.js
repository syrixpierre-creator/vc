const fs = require('fs');
const path = require('path');

class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.categories = new Map();
    this.stats = new Map();
    this.cooldowns = new Map();
    this.disabledCommands = new Set();
    this.prefixlessCommands = new Map();
    this.hooks = { message: new Map(), group: new Map(), connect: new Map(), botmsg: new Map() };
    // watchPlugins disabled — production hosts (KataBump/Pterodactyl) kill on high file churn
  }
  
  watchPlugins() {
    const pluginsPath = path.join(__dirname, '../command');
    if (!fs.existsSync(pluginsPath)) return;

    fs.watch(pluginsPath, (eventType, filename) => {
      if (filename && filename.endsWith('.js')) {
        const filePath = path.join(pluginsPath, filename);
        try {
          if (fs.existsSync(filePath)) {
            delete require.cache[require.resolve(filePath)];
            const plugin = require(filePath);
            if (plugin.command) {
              this.registerCommand(plugin);
              
              if (plugin.isPrefixless === true) {
                const cmdKey = plugin.command.toLowerCase();
                this.prefixlessCommands.set(cmdKey, cmdKey);
                if (plugin.aliases && Array.isArray(plugin.aliases)) {
                  plugin.aliases.forEach(alias => {
                    this.prefixlessCommands.set(alias.toLowerCase(), cmdKey);
                  });
                }
              }
              console.log(`[WATCHER] Hot-reloaded: ${filename}`);
            }
          }
        } catch (error) {
          console.error(`[WATCHER] Error reloading ${filename}:`, error.message);
        }
      }
    });
  }

  loadCommands() {
    const pluginsPath = path.join(__dirname, '../command');
    // Only root *.js — skip subdirs. Legacy sources live in /legacy and load via lg_* wrappers.
    // v2.5.0: sorted load order — first-wins duplicate rules are deterministic now.
    const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js') && fs.statSync(path.join(pluginsPath, f)).isFile()).sort();

    let loaded = 0, skipped = 0;
    for (const file of files) {
      try {
        const filePath = path.join(pluginsPath, file);
        // Fast prefilter: QUEEN AKUMA plugins export { command: 'name', handler }
        const head = fs.readFileSync(filePath, 'utf8').slice(0, 80000);
        const isDemon =
          /module\.exports\s*=\s*\{[\s\S]{0,5000}?command\s*:\s*['"\`]/.test(head) ||
          /exports\.command\s*=/.test(head) ||
          /exports\.default\s*=\s*\{[\s\S]{0,8000}?command\s*:\s*['"\`]/.test(head) ||
          (/module\.exports\s*=/.test(head) && /\bcommand\s*:\s*['"\`]/.test(head) && /\bhandler\s*:/.test(head)) || /commands\s*:\s*\[/.test(head);
        if (!isDemon && !/^osint/i.test(file)) {
          skipped++;
          continue; // pure legacy / helpers — not direct-loadable
        }

        delete require.cache[require.resolve(filePath)];
        let plugin = require(filePath);
        if (plugin && plugin.default) plugin = plugin.default;
        // placeholder files ("QUEEN AKUMA working handler") only answer with a generic "Try ..." text.
        // They are kept as a last-resort fallback but never override a real implementation.
        const __stub = head.includes('QUEEN AKUMA working handler');
        if (plugin && typeof plugin === 'object') {
          try {
            plugin.__file = file; plugin.__stub = __stub;
            if (Array.isArray(plugin.commands)) for (const sub of plugin.commands) if (sub && typeof sub === 'object') { sub.__file = file; sub.__stub = __stub; }
          } catch (_) {}
        }

        if (plugin && Array.isArray(plugin.commands)) {
          for (const sub of plugin.commands) {
            if (sub && sub.command && typeof sub.handler === 'function') {
              this.registerCommand(sub);
              loaded++;
            }
          }
        }
        if (plugin && plugin.command && typeof plugin.handler === 'function') {
          this.registerCommand(plugin);
          loaded++;

          if (plugin.isPrefixless === true) {
            const cmdKey = String(plugin.command).toLowerCase();
            // v2.5.0: first-wins — pehle wala prefixless command hi rahega
            if (!this.prefixlessCommands.has(cmdKey)) this.prefixlessCommands.set(cmdKey, cmdKey);
            if (plugin.aliases && Array.isArray(plugin.aliases)) {
              plugin.aliases.forEach(alias => {
                const a = String(alias).toLowerCase();
                if (!this.prefixlessCommands.has(a)) this.prefixlessCommands.set(a, cmdKey);
              });
            }
          }
        } else {
          skipped++;
        }
      } catch (error) {
        if (!this._loadErrs) this._loadErrs = 0; this._loadErrs++; const msg = String(error.message||error); if (this._loadErrs <= 5 && !/sourceType|Unexpected token|Cannot use import/.test(msg)) console.error(`[command] skip ${file}:`, msg.slice(0,100));
      }
    }
    console.log(`[command] loaded=${loaded} skipped=${skipped} total_files=${files.length}`);
    if (this._dupAliasSkips) console.log(`[command] dup-alias-skipped=${this._dupAliasSkips} (first-wins: pehle wali file ka alias hi chalta hai)`);
    if (this._replaced) console.log(`[command] replaced=${this._replaced} (native ne restored wrapper ko upgrade kiya — koi working command khoya nahi)`);
    if (typeof global.gc === 'function') {
      try { global.gc(); } catch (_) {}
    }
  }

  registerCommand(plugin) {
    // Category cleanup (renames / merges) — see lib/categories.js
    try { if (plugin && plugin.category !== 'restored') plugin.category = require('./categories').mapCategory(plugin.category); } catch (_) {}
    const { command, aliases = [], category = 'misc', handler } = plugin;
    
    // INTEGRITY CHECK
    if (!command || typeof handler !== 'function') {
      return; // skip silently (legacy/regex without QUEEN AKUMA handler)
    }
    if (typeof command !== 'string') {
      return; // only string commands
    }

    const cmdKey = command.toLowerCase();

    // PRIORITY: restored legacy wrappers (imp_*.js, category 'restored') must never mask a real
    // native command/alias. Native commands always win, regardless of file load order.
    const isRestored = plugin.__stub === true || String(category).toLowerCase() === 'restored' || /^(New plugin|Restored|Smart Engine):/i.test(String(plugin.description || ''));
    // explicit owner file for a command name (lib/priority.json): other files may not register it
    if (!this._priority) { try { this._priority = require('./priority.json'); } catch (_) { this._priority = {}; } }
    const _owner = this._priority[cmdKey];
    if (_owner && plugin.__file && plugin.__file !== _owner) return;
    const isNativeKey = (k) => {
      const direct = this.commands.get(k);
      if (direct && !direct.__wrapper) return true;
      const viaAlias = this.aliases.get(k);
      if (viaAlias && viaAlias !== k) {
        const owner = this.commands.get(viaAlias);
        if (owner && !owner.__wrapper) return true;
      }
      return false;
    };
    if (isRestored && isNativeKey(cmdKey)) return;

    // OPTIONAL HOOKS (QUEEN AKUMA): onMessage / onGroupUpdate / onConnect
    if (typeof plugin.onMessage === 'function') this.hooks.message.set(cmdKey, plugin.onMessage);
    if (typeof plugin.onGroupUpdate === 'function') this.hooks.group.set(cmdKey, plugin.onGroupUpdate);
    if (typeof plugin.onConnect === 'function') this.hooks.connect.set(cmdKey, plugin.onConnect);
    if (typeof plugin.onBotMessage === 'function') this.hooks.botmsg.set(cmdKey, plugin.onBotMessage);

    // DUPLICATE CHECK — two different native files for one command:
    // keep the FIRST one that loaded (deterministic) instead of silently
    // letting the last file overwrite a working command. Restored/stub
    // wrappers are already filtered above; priority.json owners win there.
    if (this.commands.has(cmdKey)) {
      const existing = this.commands.get(cmdKey);
      if (!isRestored && existing && !existing.__wrapper) {
        console.warn(`[DUPLICATE-SKIP] Command "${cmdKey}" already registered from ${existing.__file || 'unknown'}; skipping ${plugin.__file || 'unknown'}.`);
        return;
      }
      // v2.5.0: native replacing a restored wrapper is an UPGRADE, not a loss —
      // count it quietly instead of spamming 600+ [REPLACED] warnings.
      this._replaced = (this._replaced || 0) + 1;
    }

    this.stats.set(cmdKey, {
      calls: 0,
      errors: 0,
      totalTime: 0n, 
      avgMs: 0
    });

    const monitoredHandler = async (sock, message, ...args) => {
      const s = this.stats.get(cmdKey);
      
      if (this.disabledCommands.has(cmdKey)) {
        return await sock.sendMessage(message.key.remoteJid, { 
          text: `🚫 The command *${cmdKey}* is currently disabled.` 
        }, { quoted: message });
      }

      const userId = message.key.participant || message.key.remoteJid;
      const now = Date.now();
      const cooldownKey = `${userId}_${cmdKey}`;

      if (this.cooldowns.has(cooldownKey)) {
        const expirationTime = this.cooldowns.get(cooldownKey) + (plugin.cooldown || 300);
        if (now < expirationTime) return;
      }
      
      this.cooldowns.set(cooldownKey, now);
      const start = process.hrtime.bigint();
      
      try {
        s.calls++;
        return await handler(sock, message, ...args);
      } catch (err) {
        s.errors++;
        throw err;
      } finally {
        const end = process.hrtime.bigint();
        s.totalTime += (end - start);
        s.avgMs = Number(s.totalTime / BigInt(s.calls || 1)) / 1_000_000;
      }
    };

    this.commands.set(cmdKey, {
      ...plugin,
      __wrapper: isRestored,
      command,
      handler: monitoredHandler,
      category: category.toLowerCase(),
      aliases
    });

    for (const rawAlias of aliases) {
      const alias = String(rawAlias).toLowerCase();
      if (isRestored && isNativeKey(alias)) continue; // do not steal a native name
      if (this._priority[alias] && plugin.__file && this._priority[alias] !== plugin.__file) continue;
      // v2.5.0: ALIAS first-wins — pehle register hua alias koi baad wali file
      // overwrite nahi kar sakti. Native alias sirf tab le sakta hai jab pehle
      // wala target ek restored wrapper ho (native upgrade).
      if (this.aliases.has(alias)) {
        const prevTarget = this.aliases.get(alias);
        const prev = this.commands.get(prevTarget);
        if (!isRestored && prev && !prev.__wrapper) { this._dupAliasSkips = (this._dupAliasSkips || 0) + 1; continue; }
        if (isRestored) continue;
      }
      if (!isRestored) {
        // a native alias beats an already-registered restored command of the same name
        const clash = this.commands.get(alias);
        if (clash && alias !== cmdKey && clash.__wrapper) this.commands.delete(alias);
      }
      this.aliases.set(alias, cmdKey);
    }
    
    if (!this.categories.has(category.toLowerCase())) {
      this.categories.set(category.toLowerCase(), []);
    }
    
    if (!this.categories.get(category.toLowerCase()).includes(command)) {
       this.categories.get(category.toLowerCase()).push(command);
    }
  }

  toggleCommand(name) {
    const cmd = name.toLowerCase();
    if (this.disabledCommands.has(cmd)) {
      this.disabledCommands.delete(cmd);
      return 'enabled';
    } else {
      this.disabledCommands.add(cmd);
      return 'disabled';
    }
  }

  _levenshtein(a, b) {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) tmp[i] = [i];
    for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return tmp[a.length][b.length];
  }

  findSuggestion(cmd) {
    // v2.4.0 speed: pehle har unknown command pe 2,696+ names par pura
    // Levenshtein chalta tha. Length diff > 2 ho to distance kabhi < 3 nahi
    // ho sakta (mathematically safe skip). Distance 1 milte hi ruk jao.
    const allNames = [...this.commands.keys(), ...this.aliases.keys()];
    let bestMatch = null;
    let minDistance = 3;

    for (const name of allNames) {
      if (Math.abs(name.length - cmd.length) > 2) continue;
      const distance = this._levenshtein(cmd, name);
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = name;
        if (distance === 1) break;
      }
    }
    return bestMatch;
  }

  getDiagnostics() {
    return Array.from(this.stats.entries()).map(([name, data]) => ({
      command: name,
      usage: data.calls,
      errors: data.errors,
      average_speed: `${data.avgMs.toFixed(3)}ms`,
      status: this.disabledCommands.has(name) ? 'OFF' : 'ON'
    })).sort((a, b) => b.usage - a.usage);
  }

  resetStats() {
    this.stats.clear();
    this.cooldowns.clear();
    for (const cmd of this.commands.keys()) {
      this.stats.set(cmd, { calls: 0, errors: 0, totalTime: 0n, avgMs: 0 });
    }
  }

  reloadCommands() {
    this.commands.clear();
    this.aliases.clear();
    this.categories.clear();
    this.stats.clear();
    this.cooldowns.clear();
    this.disabledCommands.clear();
    this.prefixlessCommands.clear();
    this.hooks.message.clear(); this.hooks.group.clear(); this.hooks.connect.clear(); this.hooks.botmsg.clear();
    this.loadCommands();
  }

  getCommand(text, prefixes) {
    const usedPrefix = prefixes.find(p => text.startsWith(p));
    const firstWord = text.trim().split(' ')[0].toLowerCase();

    if (!usedPrefix) {
      if (this.prefixlessCommands.has(firstWord)) {
        const targetCmd = this.prefixlessCommands.get(firstWord);
        return this.commands.get(targetCmd);
      }
      return null;
    }

    const fullCommand = text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();
    
    if (this.commands.has(fullCommand)) {
      return this.commands.get(fullCommand);
    }
    if (this.aliases.has(fullCommand)) {
      const mainCommand = this.aliases.get(fullCommand);
      return this.commands.get(mainCommand);
    }

    const suggestion = this.findSuggestion(fullCommand);
    if (suggestion) {
      return {
        command: suggestion,
        handler: async (sock, message) => {
          const chatId = message.key.remoteJid;
          await sock.sendMessage(chatId, { 
            text: `❓ Did you mean *${usedPrefix}${suggestion}*?` 
          }, { quoted: message });
        }
      };
    }

    return null;
  }

  async runHooks(type, ...args) {
    const map = this.hooks[type];
    if (!map) return false;
    for (const [name, fn] of map) {
      try {
        const stop = await fn(...args);
        if (stop === true) return true;
      } catch (e) {
        console.error(`[HOOK:${type}:${name}]`, e.message);
      }
    }
    return false;
  }

  getCommandsByCategory(category) {
    return this.categories.get(category.toLowerCase()) || [];
  }
}

module.exports = new CommandHandler();
