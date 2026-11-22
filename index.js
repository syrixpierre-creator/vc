/* process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; */

require('./config');
require('./settings');

const { Boom } = require('@hapi/boom');
const fs = require('fs');
const chalk = require('chalk');
const FileType = require('file-type');
const syntaxerror = require('syntax-error');
const path = require('path');
const axios = require('axios');
const PhoneNumber = require('awesome-phonenumber');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, sleep, reSize } = require('./lib/myfunc');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    Browsers,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const readline = require("readline");
const { parsePhoneNumber } = require("libphonenumber-js");
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics');
const { rmSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

const store = require('./lib/lightweight_store');
const botVars = require('./lib/botVars');
const { startTelegramBot } = require('./lib/telegramBot');
try { require('./lib/botProfile'); } catch (_) {}
const SaveCreds = require('./lib/session');
const { app, server, PORT } = require('./lib/server');

// MULTI-SESSION: quand le bot tourne sous manager.js (DEMON_MANAGED=1), chaque
// bot est un process indépendant. On remonte code d'appairage + statut au manager.
const IS_MANAGED = process.env.DEMON_MANAGED === '1';
function notifyManager(msg) {
    try { if (IS_MANAGED && typeof process.send === 'function') process.send(msg); } catch (_) {}
}
const { printLog } = require('./lib/print');
const { 
    handleMessages, 
    handleGroupParticipantUpdate, 
    handleStatus,
    handleCall 
} = require('./lib/messageHandler');

const settings = require('./settings');
const commandHandler = require('./lib/commandHandler');
try { require('./lib/prodSafe').ensureDirs(); } catch (_e) {}

store.readFromFile();
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 60000);

commandHandler.loadCommands();
// console.log(chalk.greenBright(`✅ Loaded ${commandHandler.commands.size} Plugins`));

setInterval(() => {
    if (global.gc) {
        global.gc();
        console.log('🧹 Garbage collection completed');
    }
}, 60_000);

setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024;
    const MAX_RAM_MB = parseInt(process.env.MAX_RAM_MB || '700', 10);
    if (used > MAX_RAM_MB) {
        console.log(chalk.yellow(`⚠️ RAM too high (>${MAX_RAM_MB}MB), restarting bot...`));
        process.exit(1);
    }
}, 30_000);

let phoneNumber = global.PAIRING_NUMBER || process.env.PAIRING_NUMBER || "554488138425";
let owner = JSON.parse(fs.readFileSync('./data/owner.json'));

global.botname = process.env.BOT_NAME || "QUEEN AKUMA";
global.themeemoji = "•";

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");

let rl = null;
if (process.stdin.isTTY && !process.env.PAIRING_NUMBER) {
    rl = readline.createInterface({ 
        input: process.stdin, 
        output: process.stdout 
    });
}

const question = (text) => {
    if (rl && !rl.closed) {
        return new Promise((resolve) => rl.question(text, resolve));
    } else {
        return Promise.resolve(settings.ownerNumber || phoneNumber);
    }
};

process.on('exit', () => {
    if (rl && !rl.closed) {
        rl.close();
    }
});

process.on('SIGINT', () => {
    if (rl && !rl.closed) {
        rl.close();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    printLog('warning', 'SIGTERM received (host is stopping the bot). Shutting down gracefully...');
    try { if (rl && !rl.closed) rl.close(); } catch {}
    try { store.writeToFile(); } catch {}
    process.exit(0);
});

function ensureSessionDirectory() {
    const sessionPath = path.join(__dirname, 'session');
    if (!existsSync(sessionPath)) {
        mkdirSync(sessionPath, { recursive: true });
    }
    return sessionPath;
}

function hasValidSession() {
    try {
        const credsPath = path.join(__dirname, 'session', 'creds.json');
        
        if (!existsSync(credsPath)) {
            return false;
        }
        
        const fileContent = fs.readFileSync(credsPath, 'utf8');
        if (!fileContent || fileContent.trim().length === 0) {
            printLog('warning', 'creds.json exists but is empty');
            return false;
        }
        
        try {
            const creds = JSON.parse(fileContent);
            if (!creds.noiseKey || !creds.signedIdentityKey || !creds.signedPreKey) {
                printLog('warning', 'creds.json is missing required fields');
                return false;
            }
            if (creds.registered === false) {
                printLog('warning', 'Session credentials exist but are not registered');
                try {
                    rmSync(path.join(__dirname, 'session'), { recursive: true, force: true });
                } catch (e) {}
                return false;
            }
            
            printLog('success', 'Valid and registered session credentials found');
            return true;
        } catch (parseError) {
            printLog('warning', 'creds.json contains invalid JSON');
            return false;
        }
    } catch (error) {
        printLog('error', `Error checking session validity: ${error.message}`);
        return false;
    }
}

async function initializeSession() {
    ensureSessionDirectory();
    
    const txt = global.SESSION_ID || process.env.SESSION_ID;

    if (!txt) {
        printLog('warning', 'No SESSION_ID found in environment variables');
        if (hasValidSession()) {
            printLog('success', 'Existing session found. Using saved credentials');
            return true;
        }
        // v2.9.2: GitHub session restore (Mishu system) — Render/Railway par
        // restart ke baad local session delete ho jati hai, GitHub se wapas lao.
        try {
            const gh = require('./lib/githubSession');
            if (gh.isConfigured()) {
                printLog('info', 'Trying GitHub session restore...');
                const r = await gh.restoreSessionToLocal();
                if (r.ok && hasValidSession()) {
                    printLog('success', 'Session restored from GitHub (' + r.repo + ')');
                    return true;
                }
                printLog('warning', 'No GitHub session found: ' + (r.error || ''));
            }
        } catch (e) {
            printLog('warning', 'GitHub restore failed: ' + (e && e.message ? e.message : e));
        }
        printLog('warning', 'No existing session found. Pairing code will be required');
        return false;
    }
    
    if (hasValidSession()) {
        return true;
    }
    
    try {
        await SaveCreds(txt);
        await delay(2000);
        
        if (hasValidSession()) {
            printLog('success', 'Session file verified and valid');
            await delay(1000);
            return true;
        } else {
            printLog('error', 'Session file not valid after download');
            return false;
        }
    } catch (error) {
        printLog('error', `Error downloading session: ${error.message}`);
        return false;
    }
}

server.listen(PORT, () => {
    printLog('success', `Server listening on port ${PORT}`);
});

let botStarting = false;
let restartScheduled = false;

async function startDemonBot() {
    if (botStarting) return;
    botStarting = true;
    try {
        let version;
        try { const v = await fetchLatestBaileysVersion(); version = v.version; }
        catch (e) { printLog('warning', 'Latest WA version fetch failed; using Baileys default.'); }
        
        ensureSessionDirectory();
        await delay(1000);
        
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        const msgRetryCounterCache = new NodeCache();

        const hasRegisteredCreds = state.creds && state.creds.registered !== undefined;
        printLog('info', `Credentials loaded. Registered: ${state.creds?.registered || false}`);

        const ghostMode = await store.getSetting('global', 'stealthMode');
        const isGhostActive = ghostMode && ghostMode.enabled;
        
        if (isGhostActive) {
            printLog('info', '👻 STEALTH MODE IS ACTIVE - Starting in stealth mode');
        }

        const DemonBot = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,
            browser: Browsers.macOS('Chrome'),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: !isGhostActive,
            generateHighQualityLinkPreview: false,
            syncFullHistory: false,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid);
                let msg = await store.loadMessage(jid, key.id);
                return msg?.message || "";
            },
            msgRetryCounterCache,
            // group sends reuse the cached member list instead of asking WhatsApp each time
            cachedGroupMetadata: async (jid) => { try { return require('./lib/groupMetaCache').peek(jid); } catch (_) { return undefined; } },
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        });
        // one cached groupMetadata for the whole bot (admin checks, anti-link, logs…)
        try { require('./lib/groupMetaCache').wrapGroupMetadata(DemonBot); } catch (_) {}
        // channel contextInfo on every message + real numbers instead of hidden LIDs
        try { require('./lib/contextAll').install(DemonBot); } catch (e) { printLog('warning', 'contextAll: ' + e.message); }

        const originalSendPresenceUpdate = DemonBot.sendPresenceUpdate;
        const originalReadMessages = DemonBot.readMessages;
        const originalSendReceipt = DemonBot.sendReceipt;
        const originalSendReadReceipt = DemonBot.sendReadReceipt;
        
        DemonBot.sendPresenceUpdate = async function(...args) {
            const ghostMode = await store.getSetting('global', 'stealthMode');
            if (ghostMode && ghostMode.enabled) {
                printLog('info', '👻 Blocked presence update (stealth mode)');
                return;
            }
            return originalSendPresenceUpdate.apply(this, args);
        };
        
        DemonBot.readMessages = async function(...args) {
            const ghostMode = await store.getSetting('global', 'stealthMode');
            if (ghostMode && ghostMode.enabled) {
                return;
            }
            return originalReadMessages.apply(this, args);
        };

        if (originalSendReceipt) {
            DemonBot.sendReceipt = async function(...args) {
                const ghostMode = await store.getSetting('global', 'stealthMode');
                if (ghostMode && ghostMode.enabled) {
                    return;
                }
                return originalSendReceipt.apply(this, args);
            };
        }
        
        if (originalSendReadReceipt) {
            DemonBot.sendReadReceipt = async function(...args) {
                const ghostMode = await store.getSetting('global', 'stealthMode');
                if (ghostMode && ghostMode.enabled) {
                    return;
                }
                return originalSendReadReceipt.apply(this, args);
            };
        }
        
        const originalQuery = DemonBot.query;
        DemonBot.query = async function(node, ...args) {
            const ghostMode = await store.getSetting('global', 'stealthMode');
            if (ghostMode && ghostMode.enabled) {
                if (node && node.tag === 'receipt') {
                    return;
                }
                if (node && node.attrs && (node.attrs.type === 'read' || node.attrs.type === 'read-self')) {
                    return;
                }
            }
            return originalQuery.apply(this, [node, ...args]);
        };
        
        // FAST: cache stealth mode 15s — avoid DB hit every message
        let _ghostCache = { v: false, t: 0 };
        DemonBot.isGhostMode = async () => {
            if (Date.now() - _ghostCache.t < 15000) return _ghostCache.v;
            try {
                const ghostMode = await store.getSetting('global', 'stealthMode');
                _ghostCache = { v: !!(ghostMode && ghostMode.enabled), t: Date.now() };
            } catch { _ghostCache = { v: false, t: Date.now() }; }
            return _ghostCache.v;
        };

        DemonBot.ev.on('creds.update', saveCreds);
        // v2.9.2: GitHub auto-save (Mishu system) — creds badle to 10s baad
        // GitHub repo me save karo, taaki restart par session na khoye.
        try {
            const gh = require('./lib/githubSession');
            DemonBot.ev.on('creds.update', () => { try { gh.scheduleAutoSave(); } catch (_) {} });
        } catch (_) {}

        // SPEED: cache group metadata (admin/owner checks ran a network query on every command)
        // v3.5.0 — shared lib (lib/groupMetaCache.js): main sock + .addbot/.rentbot
        // clones sab 60s TTL cache se chalte hain; groups.update /
        // group-participants.update par auto-invalidate hota hai.
        require('./lib/groupMetaCache').wrapGroupMetadata(DemonBot);
        store.bind(DemonBot.ev);
        // ALWAYS_ONLINE from .setvar
        setInterval(async () => {
            try {
                if (botVars.isTrue('ALWAYS_ONLINE')) {
                    await DemonBot.sendPresenceUpdate('available');
                }
            } catch (_) {}
        }, 25000);

        
        const processUpsert = async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.message) return;
                
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') 
                    ? mek.message.ephemeralMessage.message 
                    : mek.message;

                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    await handleStatus(DemonBot, chatUpdate);
                    return;
                }

                if (!DemonBot.public && !mek.key.fromMe && chatUpdate.type === 'notify') {
                    const isGroup = mek.key?.remoteJid?.endsWith('@g.us');
                    if (!isGroup) {
                        // Private mode ignores DMs for commands, but anti-delete must still see them
                        try {
                            const ad = require('./command/antidelete');
                            const pm = mek.message || {};
                            const proto = pm.protocolMessage || pm.ephemeralMessage?.message?.protocolMessage;
                            if (proto && (proto.type === 0 || proto.type === 'REVOKE')) await ad.handleMessageRevocation(DemonBot, mek);
                            else await ad.storeMessage(DemonBot, mek);
                        } catch (_) {}
                        return;
                    }
                }

                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) {
                    // other Baileys bots: ignored for commands, but protection plugins (anti-bot) may act
                    if (!mek.key.fromMe && mek.key.remoteJid?.endsWith('@g.us')) {
                        try { await commandHandler.runHooks('botmsg', DemonBot, mek); } catch {}
                    }
                    // v2.8.3: anti-delete ke liye in messages ko bhi store karo —
                    // warna dusre bot ke messages delete hone par recover nahi hote
                    try { require('./command/antidelete').storeMessage(DemonBot, mek).catch(() => {}); } catch (_) {}
                    return;
                }

                // FAST: skip cache clear every message

                try {
                    await handleMessages(DemonBot, chatUpdate);
                } catch (err) {
                    printLog('error', `Error in handleMessages: ${err.message}`);
                    if (mek.key && mek.key.remoteJid) {
                        await DemonBot.sendMessage(mek.key.remoteJid, { text: '❌ An error occurred while processing your message.' }).catch(() => {});
                    }
                }
            } catch (err) {
                printLog('error', `Error in messages.upsert: ${err.message}`);
            }
        };
        DemonBot.ev.on('messages.upsert', (cu) => {
            // FAST: do not await — each message runs independently so commands respond ASAP
            for (const m of (cu.messages || [])) {
                processUpsert({ ...cu, messages: [m] }).catch((err) => {
                    printLog('error', `upsert: ${err && err.message}`);
                });
            }
        });

        // Anti-delete: some WhatsApp versions deliver deletes as messages.update instead of a REVOKE upsert
        DemonBot.ev.on('messages.update', (updates) => {
            try {
                require('./command/antidelete').handleMessageUpdates(DemonBot, updates).catch(() => {});
            } catch (_) {}
        });

        DemonBot.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            } else return jid;
        };

        DemonBot.ev.on('contacts.update', update => {
            for (let contact of update) {
                let id = DemonBot.decodeJid(contact.id);
                if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
            }
        });

        DemonBot.getName = (jid, withoutContact = false) => {
            const id = DemonBot.decodeJid(jid);
            withoutContact = DemonBot.withoutContact || withoutContact;
            let v;
            if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
                v = store.contacts[id] || {};
                if (!(v.name || v.subject)) v = DemonBot.groupMetadata(id) || {};
                resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'));
            });
            else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === DemonBot.decodeJid(DemonBot.user.id) ?
                DemonBot.user :
                (store.contacts[id] || {});
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
        };

        // v2.9.0: custom pairing — Telegram /pair + website /code ke liye
        // main socket pairing engine ko de do (request time par use hota hai).
        try { require('./lib/pairing').setSocket(DemonBot); } catch (_) {}
        try { require('./lib/scheduler').setSocket(DemonBot); require('./lib/scheduler').start(); } catch (_) {}
        try { require('./lib/schedMsg').setSocket(DemonBot); require('./lib/schedMsg').start(); } catch (_) {}
        if (!IS_MANAGED) { try { require('./lib/multiBot').autostart(); } catch (_) {} }
        try { require('./lib/ludoGame').setSocket(DemonBot); require('./lib/ludoGame').startTimer(); } catch (_) {}

        DemonBot.public = true;
        DemonBot.serializeM = (m) => smsg(DemonBot, m, store);

        const isRegistered = state.creds?.registered === true;
        
        if (pairingCode && !isRegistered) {
            if (useMobile) throw new Error('Cannot use pairing code with mobile api');

            printLog('warning', 'Session not registered. Pairing code required');

            let phoneNumberInput;
            if (!!global.phoneNumber) {
                phoneNumberInput = global.phoneNumber;
            } else if (process.env.PAIRING_NUMBER) {
                phoneNumberInput = process.env.PAIRING_NUMBER;
                printLog('info', `Using phone number from environment: ${phoneNumberInput}`);
            } else if (rl && !rl.closed) {
                phoneNumberInput = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFormat: 6281376552730 (without + or spaces) : `)));
            } else {
                phoneNumberInput = phoneNumber;
                printLog('info', `Using default phone number: ${phoneNumberInput}`);
            }

            phoneNumberInput = phoneNumberInput.replace(/[^0-9]/g, '');

            const pn = require('awesome-phonenumber');
            if (!pn('+' + phoneNumberInput).isValid()) {
                printLog('error', 'Invalid phone number format');
                if (rl && !rl.closed) rl.close();
                // Managed (multi-session): don't crash-loop on a bad number.
                // Report it so the manager stops this bot and the site shows why.
                if (IS_MANAGED) {
                    notifyManager({ type: 'status', status: 'invalid-number' });
                    await new Promise((r) => setTimeout(r, 300));
                    process.exit(0);
                }
                process.exit(1);
            }

            setTimeout(async () => {
                try {
                    let code = await DemonBot.requestPairingCode(phoneNumberInput);
                    // new link: the "connected" message will be sent once, at the first connection
                    try { const _d = path.join(__dirname, 'data'); fs.mkdirSync(_d, { recursive: true }); fs.writeFileSync(path.join(_d, 'pending-welcome.json'), JSON.stringify({ at: Date.now() })); try { fs.unlinkSync(path.join(_d, 'welcome-sent.json')); } catch (_) {} } catch (_) {}
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)));
                    printLog('success', `Pairing code generated: ${code}`);
                    notifyManager({ type: 'pairing-code', code, number: phoneNumberInput });
                    
                    if (rl && !rl.closed) {
                        rl.close();
                        rl = null;
                    }
                } catch (error) {
                    printLog('error', `Failed to get pairing code: ${error.message}`);
                }
            }, 3000);
        } else if (isRegistered) {
            if (rl && !rl.closed) {
                rl.close();
                rl = null;
            }
        } else {
            printLog('warning', 'Waiting for connection to establish...');
            if (rl && !rl.closed) {
                rl.close();
                rl = null;
            }
        }

        DemonBot.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s;
            
            if (qr) {
                printLog('info', 'QR Code generated. Please scan with WhatsApp');
            }
            
            if (connection === 'connecting') {
                printLog('connection', 'Connecting to WhatsApp...');
                notifyManager({ type: 'status', status: 'connecting' });
            }
            
            if (connection == "open") {
                printLog('success', 'Bot connected successfully!');
                notifyManager({ type: 'status', status: 'connected', jid: DemonBot.user && DemonBot.user.id });
                try { require('./lib/botNetwork').setSock(DemonBot); } catch (_) {}
                try { require('./lib/devChannel').start(DemonBot); } catch (_) {}
                // v2.4.0 speed: menu media background me warm kar lo — pehla .menu bhi fast
                try { require('./lib/mediaCache').warmMediaCache(); } catch {}
                const { startAutoBio } = require('./command/setbio');
                startAutoBio(DemonBot); 
                const ghostMode = await store.getSetting('global', 'stealthMode');
                if (ghostMode && ghostMode.enabled) {
                    printLog('info', '👻 STEALTH MODE ACTIVE - Bot is in stealth mode');
                    console.log(chalk.gray('• No online status'));
                    console.log(chalk.gray('• No typing indicators'));
                }
                
                console.log(chalk.yellow(`🌿Connected to => ` + JSON.stringify(DemonBot.user, null, 2)));

                // "Connected" message: ONLY at the first connection after pairing — never after
                // a restart, an update or a reconnection (anti-spam).
                try {
                    const _d = path.join(__dirname, 'data');
                    const pending = path.join(_d, 'pending-welcome.json');
                    const done = path.join(_d, 'welcome-sent.json');
                    if (fs.existsSync(pending) && !fs.existsSync(done)) {
                        fs.writeFileSync(done, JSON.stringify({ at: Date.now() }));
                        try { fs.unlinkSync(pending); } catch (_) {}
                        const botNumber = DemonBot.user.id.split(':')[0] + '@s.whatsapp.net';
                        const caption = `QUEEN AKUMA CONNECTED 💞\n\n\n> MADE IN BY INCONNU BOY SENSEI`;
                        let img = null;
                        try { img = require('./lib/botImage').botImageBuffer(); } catch (_) {}
                        await DemonBot.sendMessage(botNumber, img ? { image: img, caption } : { text: caption });
                    } else if (fs.existsSync(pending)) {
                        try { fs.unlinkSync(pending); } catch (_) {}
                    }
                } catch (error) {
                    printLog('error', `Failed to send connection message: ${error.message}`);
                }

                try { await commandHandler.runHooks('connect', DemonBot); } catch (e) { printLog('error', `connect hooks: ${e.message}`); }
                try { startTelegramBot(); } catch (e) { printLog('warning', 'Telegram: ' + (e && e.message ? e.message : e)); }

                 await delay(1999);
                console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname || 'QUEEN AKUMA'} ]`)}\n\n`));
                console.log(chalk.cyan(`< ================================================== >`));
                console.log(chalk.magenta(`\n${global.themeemoji || '•'} CHANNEL: INCONNU BOY SENSEI`));
                console.log(chalk.magenta(`${global.themeemoji || '•'} OWNER: INCONNU BOY SENSEI`));
                console.log(chalk.magenta(`${global.themeemoji || '•'} WA NUMBER: ${owner}`));
                console.log(chalk.magenta(`${global.themeemoji || '•'} CREDIT: QUEEN AKUMA`));
                console.log(chalk.green(`${global.themeemoji || '•'} 🤖 Bot Connected Successfully! ✅`));
                console.log(chalk.blue(`Bot Version: ${settings.version}`));
                console.log(chalk.cyan(`Loaded Commands: ${commandHandler.commands.size}`));
                console.log(chalk.cyan(`Prefixes: ${settings.prefixes.join(', ')}`));
                console.log(chalk.gray(`Backend: ${store.getStats().backend}`));
                console.log();
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                printLog('error', `Connection closed - Status: ${statusCode}`);
                notifyManager({ type: 'status', status: (statusCode === DisconnectReason.loggedOut || statusCode === 401) ? 'logged-out' : 'reconnecting', code: statusCode });
                
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                    try {
                        rmSync('./session', { recursive: true, force: true });
                        printLog('warning', 'Session logged out. Please re-authenticate');
                    } catch (error) {
                        printLog('error', `Error deleting session: ${error.message}`);
                    }
                }
                
                if (shouldReconnect && !restartScheduled) {
                    restartScheduled = true;
                    printLog('connection', 'Reconnecting in 5 seconds...');
                    await delay(5000);
                    restartScheduled = false; botStarting = false;
                    startDemonBot();
                }
            }
        });

        DemonBot.ev.on('call', async (calls) => {
            await handleCall(DemonBot, calls);
        });

        DemonBot.ev.on('group-participants.update', async (update) => {
            await handleGroupParticipantUpdate(DemonBot, update);
        });

        DemonBot.ev.on('status.update', async (status) => {
            await handleStatus(DemonBot, status);
        });

        DemonBot.ev.on('messages.reaction', async (reaction) => {
            await handleStatus(DemonBot, reaction);
        });

        return DemonBot;
    } catch (error) {
        printLog('error', `Error in startDemonBot: ${error.message}`);
        
        if (rl && !rl.closed) {
            rl.close();
            rl = null;
        }
        
        await delay(5000);
        restartScheduled = false; botStarting = false;
        startDemonBot();
    }
}


async function main() {
    printLog('info', 'Starting QUEEN AKUMA BOT...');
    
    const sessionReady = await initializeSession();
    
    if (sessionReady) {
        printLog('success', 'Session initialization complete. Starting bot...');
    } else {
        printLog('warning', 'Session initialization incomplete. Will attempt pairing...');
    }
    
    await delay(3000);
    
    startDemonBot().catch(error => {
        printLog('error', `Fatal error: ${error.message}`);
        
        if (rl && !rl.closed) {
            rl.close();
        }
        
        process.exit(1);
    });
}

main();


const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

setInterval(() => {
  fs.readdir(customTemp, (err, files) => {
    if (err) return;
    for (const file of files) {
      const filePath = path.join(customTemp, file);
      fs.stat(filePath, (err, stats) => {
        if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
          fs.unlink(filePath, () => {});
        }
      });
    }
  });
//  console.log('🧹 Temp folder auto-cleaned');
}, 1 * 60 * 60 * 1000);

const folders = [
  path.join(__dirname, './lib'),
  path.join(__dirname, './command')
];

let totalFiles = 0;
let okFiles = 0;
let errorFiles = 0;

folders.forEach(folder => {
  if (!fs.existsSync(folder)) return;

  fs.readdirSync(folder)
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
      totalFiles++;
      const filePath = path.join(folder, file);

      try {
        const code = fs.readFileSync(filePath, 'utf-8');
        const err = syntaxerror(code, file, {
          sourceType: 'script',
          allowAwaitOutsideFunction: true
        });

        if (err) {
          console.error(chalk.red(`❌ Syntax error in ${filePath}:\n${err}`));
          errorFiles++;
        } else {
          okFiles++;
        }
      } catch (e) {
        console.error(chalk.yellow(`⚠️ Cannot read file ${filePath}:\n${e}`));
        errorFiles++;
      }
    });
});

/**
* console.log(chalk.greenBright(`✅ OK files: ${okFiles}`));
* console.log(chalk.redBright(`❌Files with errors: ${errorFiles}\n`));
*/

process.on('uncaughtException', (err) => {
    printLog('error', `Uncaught Exception: ${err.message}`);
    console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
    printLog('error', `Unhandled Rejection: ${err.message}`);
    console.error(err.stack);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        printLog('error', `Address localhost:${PORT} in use`);
        server.close();
    } else {
        printLog('error', `Server error: ${error.message}`);
    }
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    printLog('info', 'index.js updated, reloading...');
    delete require.cache[file];
    require(file);
});


