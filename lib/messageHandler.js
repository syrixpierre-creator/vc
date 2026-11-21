
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const store = require('./lightweight_store');
const commandHandler = require('./commandHandler');
const { printMessage, printLog } = require('./print');
const { isBanned } = require('./isBanned');
const { isSudo } = require('./index');
const isOwnerOrSudo = require('./isOwner');
const errorLog = require('./errorLog');
const botVars = require('./botVars');
const tempAccess = require('./tempAccess');
const isAdmin = require('./isAdmin');
const { handleAutoread } = require('../command/autoread');
const { handleAutotypingForMessage, showTypingAfterCommand } = require('../command/autotyping');
const { storeMessage, handleMessageRevocation } = require('../command/antidelete');
const { handleAutoIntro } = require('../command/intro');
const { handleAutoDetectVv } = require('./vv-autodetect');
let _areactAttached = false;
function ensureAutoReact(sock) {
  if (_areactAttached) return;
  try {
    const ar = require('../command/areact');
    if (ar.attachListener) { ar.attachListener(sock); _areactAttached = true; }
  } catch (_) {}
}
const { handleBadwordDetection } = require('./antibadword');
const { handleLinkDetection } = require('../command/antilink');
const { handleTagDetection } = require('../command/antitag');
const { handleMentionDetection } = require('../command/mention');
const { handleChatbotResponse } = require('../command/chatbot');
const { handleDexbotMessage } = require('./dexbot');
const { handleTicTacToeMove } = require('../command/tictactoe');
const { addCommandReaction } = require('./reactions');

const { channelInfo } = require('./messageConfig');
const { fakevCard } = require('./fakevCard');

/** Apply global style — with plain fallback if styled send fails */
function styleSock(sock, { useFakeQuote = true, useChannel = true } = {}) {
    if (sock.__demonStyled) return sock;
    const original = sock.sendMessage.bind(sock);
    sock.sendMessage = async (jid, content, options = {}) => {
        let styledContent = content;
        let styledOptions = { ...(options || {}) };
        try {
            if (content && typeof content === 'object' && !Buffer.isBuffer(content)) {
                const prev = (content.contextInfo && typeof content.contextInfo === 'object')
                    ? content.contextInfo
                    : {};
                const base = (useChannel && channelInfo && channelInfo.contextInfo)
                    ? channelInfo.contextInfo
                    : {};
                // Merge: channel forward + ad reply + any per-message contextInfo
                styledContent = {
                    ...content,
                    contextInfo: {
                        ...base,
                        ...prev,
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo:
                            (prev.forwardedNewsletterMessageInfo) ||
                            (base.forwardedNewsletterMessageInfo) ||
                            undefined
                    }
                };
            }
            // v2.5.0: fakevCard HAR command reply pe — caller ne { quoted: message }
            // diya ho tab bhi. Ye sirf display hai (reply kis card ko quote karta
            // hai); command ka asli quoted-message padhna isse affect nahi hota.
            // Reactions (content.react) pe quote nahi lagate — wo bina quote ke jati hai.
            if (useFakeQuote && !(content && content.react)) {
                styledOptions.quoted = fakevCard;
            }
        } catch (_) {}

        try {
            return await original(jid, styledContent, styledOptions);
        } catch (e1) {
            // Retry with vCard only (no channel flags)
            try {
                const opt2 = { ...(options || {}) };
                if (useFakeQuote && !(content && content.react)) opt2.quoted = fakevCard;
                return await original(jid, content, opt2);
            } catch (e2) {
                // Retry with user quote / plain
                try {
                    const opt3 = options && options.quoted ? { quoted: options.quoted } : {};
                    return await original(jid, content, opt3);
                } catch (e3) {
                    const plain = content && content.text != null ? { text: content.text } : content;
                    return await original(jid, plain, {});
                }
            }
        }
    };
    sock.__demonStyled = true;
    return sock;
}

// FAST caches (TTL 10–15s)
let _botModeCache = { v: 'public', t: 0 };
function clearBotModeCache() {
    _botModeCache = { v: 'public', t: 0 };
}





/** Private/self mode — non-owner: sticker-react + ultra stylish front text */
const PRIVATE_DENY_STICKERS = ["🌚","👑","🚫","🤡","🐕","🧊","🫡","🧃","😤","📵","🎭","🧠","🛕","💤","🪓","🔒","🔥","💀","👀","🫡"];

const PRIVATE_DENY_REPLIES = [
  { emoji: "🌚", title: "ᴘᴀᴘᴀ ᴘᴇʀᴍɪꜱꜱɪᴏɴ", tag: "ʀᴇǫᴜɪʀᴇᴅ", body: "✦ Ek baar *ᴘᴀᴘᴀ* bolo\n✦ Phir bot kaam karega…\n\n┊ apne *okhat* pe raho\n┊ samjha beta 🌚" },
  { emoji: "👑", title: "ᴏᴡɴᴇʀ ᴏɴʟʏ", tag: "ᴢᴏɴᴇ", body: "✦ Ye bot *private mode* me hai\n✦ Sirf *Owner* command chala sakta hai\n\n┊ Apne level pe raho beta" },
  { emoji: "🚫", title: "ᴄᴏᴍᴍᴀɴᴅ", tag: "ʟᴏᴄᴋᴇᴅ", body: "✦ *Papa* se permission lo\n✦ Tabhi unlock hoga\n\n┊ Okhat yaad rakh 🫡" },
  { emoji: "🔒", title: "ᴘʀɪᴠᴀᴛᴇ ᴍᴏᴅᴇ", tag: "ᴏɴ", body: "✦ `.menu` / `.ping` bhi owner-only\n\n┊ Respectfully *Papa* bol ke dekh 🌚" },
  { emoji: "😤", title: "ʙᴇᴛᴀ ꜱᴛᴏᴘ", tag: "ɴᴏᴡ", body: "✦ Command mat daal biajha\n✦ Owner ke bina yahan kuch nahi\n\n┊ *Papa* bolo → phir sochenge" },
  { emoji: "🫡", title: "ᴏᴡɴᴇʀ ᴍᴏᴅᴇ", tag: "ᴀᴄᴛɪᴠᴇ", body: "✦ Public users ke liye reply band\n\n┊ Apni aukaat me raho beta" },
  { emoji: "📵", title: "ᴀᴄᴄᴇꜱꜱ", tag: "ᴅᴇɴɪᴇᴅ", body: "✦ Sirf bot owner commands use kar sakta hai\n\n┊ Ek baar Papa bol… warna silent 🌚" },
  { emoji: "🎭", title: "ɴᴏ ʀᴇꜱᴘᴏɴꜱᴇ", tag: "ᴘʀɪᴠᴀᴛᴇ", body: "✦ Tu command de raha hai\n✦ Output nahi milega\n\n┊ Okhat pe baith, Papa aayenge to chalega" },
  { emoji: "🤓", title: "ᴡɪᴋɪ ᴄʟᴏꜱᴇᴅ", tag: "ꜰᴀɪʟ", body: "✦ Wikipedia padh ke mat aana\n✦ Rule: *Papa* > sab\n\n┊ Okhat maintain karo 🌚" },
  { emoji: "🧊", title: "ᴄᴏᴏʟ ᴅᴏᴡɴ", tag: "ʙᴇᴛᴀ", body: "✦ Command free me nahi milta\n\n┊ *Papa* ke feet pe request daal" },
  { emoji: "🤡", title: "ᴍᴇᴍʙᴇʀꜱʜɪᴘ", tag: "ɴᴇᴇᴅᴇᴅ", body: "✦ Menu dekhne aaya tha?\n✦ Pehle lo: *Papa Permission*\n\n┊ Samjha beta?" },
  { emoji: "🐕", title: "ɴᴏ ʙᴀʀᴋɪɴɢ", tag: "ꜱᴛᴏᴘ", body: "✦ Bhaukna band, spam mat kar\n✦ Private mode hai, circus nahi\n\n┊ Okhat + respect = maybe reply" },
  { emoji: "🛕", title: "ᴘᴀᴘᴀ ᴍᴀɴᴅɪʀ", tag: "ᴇɴᴛʀʏ", body: "✦ Is mandir me sirf *Papa* free\n✦ Baaki ticket: ek sweet *Papa* 🌚" },
  { emoji: "🧠", title: "ɪǫ ᴛᴇꜱᴛ", tag: "ꜰᴀɪʟ", body: "✦ Private bot pe command = overconfidence\n\n┊ Level down kar, beta" },
  { emoji: "🧃", title: "ɴᴏᴛ ꜰʀᴇᴇ", tag: "ᴡɪꜰɪ", body: "✦ Free ka bot samjha kya?\n✦ Owner ka personal hai\n\n┊ *Papa* bolo warna block energy 🚫" },
  { emoji: "📺", title: "ᴀᴅ ʙʀᴇᴀᴋ", tag: "ʀᴇᴊᴇᴄᴛ", body: "✦ Private mode me sirf owner ka raj\n✦ Aap apply nahi kar sakte\n\n┊ Okhat pe clap 👏" },
  { emoji: "🪓", title: "ᴘᴇʀᴍɪꜱꜱɪᴏɴ", tag: "ꜰɪʀꜱᴛ", body: "✦ Command todne aaya?\n✦ Pehle permission tod\n\n┊ Papa ke bina air bhi paid hai" },
  { emoji: "💤", title: "ꜱʟᴇᴇᴘ ᴍᴏᴅᴇ", tag: "ʟᴀᴛᴇʀ", body: "✦ So ja beta, kal shayad public\n✦ Aaj nahi\n\n┊ *Papa* dream me bol lena 🌚" },
  { emoji: "🌚", title: "ꜱᴛɪᴄᴋᴇʀ ᴠɪʙᴇꜱ", tag: "ɴᴏᴘᴇ", body: "✦ React se bhi unlock nahi\n✦ Sirf *Papa* ki approval\n\n┊ Okhat + emoji != permission" },
  { emoji: "👑", title: "ʀᴏʏᴀʟ ʟᴏᴄᴋ", tag: "ᴋɪɴɢ", body: "✦ King so raha hai\n✦ Servant commands offline\n\n┊ *Papa* jago to bot jage 🫡" }
];

function privateModeDenyPayload() {
  const item = PRIVATE_DENY_REPLIES[Math.floor(Math.random() * PRIVATE_DENY_REPLIES.length)];
  const sticker = item.emoji || PRIVATE_DENY_STICKERS[Math.floor(Math.random() * PRIVATE_DENY_STICKERS.length)];
  const text =
    "╭━━━『 " + sticker + " 』━━━━━━━━╮\n" +
    "┃  *" + item.title + "*\n" +
    "┃  ˚₊· ͟͟͞͞➳ " + item.tag + "\n" +
    "╰━━━━━━━━━━━━━━━━━━╯\n\n" +
    "┌─⊷ *ꜱᴛᴀᴛᴜꜱ*\n" +
    "│\n" +
    item.body.split("\n").map(function (line) {
      return line ? ("│  " + line) : "│";
    }).join("\n") + "\n" +
    "│\n" +
    "└───────────────⊷\n\n" +
    "✧ 🔐 ᴍᴏᴅᴇ › *ᴘʀɪᴠᴀᴛᴇ*\n" +
    "✧ 👤 ᴀᴄᴄᴇꜱꜱ › *ᴏᴡɴᴇʀ ᴏɴʟʏ*\n" +
    "✧ " + sticker + " ᴠɪʙᴇ › *ɴᴏ ᴇɴᴛʀʏ*";
  return { sticker, text };
}

function privateModeDenyText() {
  return privateModeDenyPayload().text;
}

async function replyPrivateDenied(sock, chatId, message, channelInfo = {}) {
  try {
    const { sticker, text } = privateModeDenyPayload();
    sock.sendMessage(chatId, {
      react: { text: sticker, key: message.key }
    }).catch(function () {});
    await sock.sendMessage(chatId, Object.assign({ text: text }, channelInfo || {}), { quoted: message });
  } catch (e) {}
}


/** Private mode: owner full; temp-access users limited cmds; else deny */
function resolvePrivateAccess({ isOwnerOrSudoCheck, senderId, sock, message, commandName }) {
    if (isOwnerOrSudoCheck) return { allow: true, reason: 'owner' };

    // Reply to owner message → grant 15 min limited access
    if (tempAccess.isReplyToOwner(message, sock)) {
        tempAccess.grantTempAccess(senderId);
        const mins = tempAccess.tempRemainingMin(senderId);
        return {
            allow: true,
            reason: 'temp_grant',
            mins,
            limited: true
        };
    }

    if (tempAccess.hasTempAccess(senderId)) {
        return {
            allow: true,
            reason: 'temp',
            mins: tempAccess.tempRemainingMin(senderId),
            limited: true
        };
    }

    return { allow: false, reason: 'deny' };
}








async function getBotModeFast() {
    if (Date.now() - _botModeCache.t < 3000) return _botModeCache.v;
    try {
        const m = await store.getBotMode();
        _botModeCache = { v: m || 'public', t: Date.now() };
    } catch { _botModeCache = { v: 'public', t: Date.now() }; }
    return _botModeCache.v;
}




const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const STICKER_FILE = path.join(__dirname, '../data/sticker_commands.json');
// v2.4.0 speed: sticker commands har message pe disk se padhe jate the
// (readFileSync + JSON.parse). 5s TTL memory cache — file badle to bhi
// 5s me naya data aa jata hai.
let _stickerCache = { t: 0, data: {} };

async function getStickerCommands() {
    if (Date.now() - _stickerCache.t < 5000) return _stickerCache.data;
    if (HAS_DB) {
        const data = await store.getSetting('global', 'stickerCommands');
        _stickerCache = { t: Date.now(), data: data || {} };
        return _stickerCache.data;
    } else {
        try {
            if (!fs.existsSync(STICKER_FILE)) {
                _stickerCache = { t: Date.now(), data: {} };
                return {};
            }
            const data = JSON.parse(fs.readFileSync(STICKER_FILE, 'utf8'));
            _stickerCache = { t: Date.now(), data };
            return data;
        } catch {
            return _stickerCache.data;
        }
    }
}

async function handleMessages(sock, messageUpdate) {
    try {
        // SPEED: har connection ka groupMetadata 60s cache se chale
        // (lib/groupMetaCache.js — idempotent, main + clone socks).
        try { require('./groupMetaCache').wrapGroupMetadata(sock); } catch (_) {}
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // FAST: logging + autoread never block command path
        printMessage(message, sock).catch(() => {});
        (async () => {
            try {
                const ghost = sock.isGhostMode ? await sock.isGhostMode() : false;
                if (!ghost) handleAutoread(sock, message).catch(() => {});
            } catch {
                handleAutoread(sock, message).catch(() => {});
            }
        })();

        const chatId = message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        {
            // unwrap ephemeral for delete protocol
            let _msg = message.message || {};
            if (_msg.ephemeralMessage?.message) _msg = _msg.ephemeralMessage.message;
            const proto = _msg.protocolMessage;
            const ptype = proto?.type;
            const isEdit = ptype === 14 || ptype === 'MESSAGE_EDIT';
            const isRevoke = proto && (ptype === 0 || ptype === 'REVOKE' || String(ptype).toUpperCase() === 'REVOKE');
            if (isRevoke) {
                printLog('info', 'Message deletion detected');
                // attach unwrapped for handler
                try { message.message = { ...message.message, protocolMessage: proto }; } catch (_) {}
                handleMessageRevocation(sock, message).catch(e => printLog('error', 'antidelete: ' + e.message));
                return;
            }
            if (isEdit) {
                // v3.4.1: edit events antiedit hook tak jaane chahiye — yahan return NAHI.
                // runHooks (line ~694) se antiedit.onMessage chalega, phir edit ko
                // command samajhne se rokne ke liye aage ek flag set karo.
                try { message.message = { ...message.message, protocolMessage: proto }; } catch (_) {}
                message._isEditEvent = true;
            }
        }

        // Non-blocking store (media download async inside)
        storeMessage(sock, message).catch(() => {});

        // Auto ViewOnce detect → owner DM (if .setdetectvv on for this chat)
        ensureAutoReact(sock);
        handleAutoDetectVv(sock, message).catch(e => printLog('error', 'vv-auto: ' + (e && e.message)));

        // Auto intro: plain "intro" in group or DM
        try {
            const plain = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').trim().toLowerCase();
            if (plain === 'intro' || plain === 'my intro') {
                const handled = await handleAutoIntro(sock, message);
                if (handled) return;
            }
        } catch (e) {}

        const senderId = message.key.participant || message.key.remoteJid;

        if (message.message?.stickerMessage) {
            const fileSha256 = message.message.stickerMessage.fileSha256;
            if (fileSha256) {
                const hash = Buffer.from(fileSha256).toString('base64');
                const stickers = await getStickerCommands();
                
                if (stickers[hash]) {
                    printLog('info', `🎨 Sticker command detected: ${stickers[hash].text}`);
                    
                    const commandText = stickers[hash].text;
                    const [cmdName, ...cmdArgs] = commandText.split(' ');
                    
                    let foundCommand = null;
                    let usedPrefix = '';
                    
                    for (const prefix of settings.prefixes) {
                        const testCmd = (prefix + cmdName).toLowerCase();
                        foundCommand = commandHandler.getCommand(testCmd, settings.prefixes);
                        if (foundCommand) {
                            usedPrefix = prefix;
                            break;
                        }
                    }
                    
                    if (foundCommand) {
                        const senderIsSudo = await isSudo(senderId);
                        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);
                        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;

                        // v3.6.0 SLEEP MODE — sticker se trigger hone wale commands bhi
                        try {
                          const sleepMode = require('./sleepMode');
                          if (sleepMode.isSleeping() && !isOwnerOrSudoCheck && !message.key.fromMe) {
                            const cmdName = String((foundCommand.command || foundCommand.name) || '').toLowerCase();
                            const firstArg = (String(commandText).trim().split(/\s+/)[1] || '').toLowerCase();
                            let wakeAllowed = false;
                            if (cmdName === 'sleepmode' && (firstArg === 'off' || firstArg === 'status' || firstArg === '')) {
                              if (isGroup) {
                                try { const st = await require('./isAdmin')(sock, chatId, senderId); wakeAllowed = !!st.isSenderAdmin; } catch (_) {}
                              }
                            }
                            if (!wakeAllowed) return;
                          }
                        } catch (_) {}

                        const botMode = await getBotModeFast();
                        let isAllowed = (() => {
                            if (isOwnerOrSudoCheck) return true;
                            switch (botMode) {
                                case 'public': return true;
                                case 'private':
                                case 'self': return false;
                                case 'groups': return isGroup;
                                case 'inbox': return !isGroup;
                                default: return true;
                            }
                        })();

                        let tempLimited = false;
                        if (!isAllowed && (botMode === 'private' || botMode === 'self')) {
                            const acc = resolvePrivateAccess({
                                isOwnerOrSudoCheck, senderId, sock, message,
                                commandName: foundCommand && (foundCommand.command || foundCommand.name)
                            });
                            if (acc.allow) {
                                isAllowed = true;
                                tempLimited = !!acc.limited;
                                if (acc.reason === 'temp_grant') {
                                    sock.sendMessage(chatId, {
                                        text: `✅ *Temp access* mil gaya (${acc.mins} min)
Limited: play, song, menu, ping, sticker…
_Owner ke message pe reply se unlock_`
                                    }, { quoted: message }).catch(() => {});
                                }
                            } else {
                                await replyPrivateDenied(sock, chatId, message, typeof channelInfo !== 'undefined' ? channelInfo : {});
                                return;
                            }
                        }
                        if (!isAllowed) return;

                        if (tempLimited) {
                            const cn = String((foundCommand && (foundCommand.command || foundCommand.name)) || '').toLowerCase();
                            if (!tempAccess.isLimitedCommand(cn)) {
                                await sock.sendMessage(chatId, {
                                    text: `⏳ Temp access pe ye command nahi.\nAllowed: play, song, menu, ping, sticker, video…\nTime left: *${tempAccess.tempRemainingMin(senderId)} min*`
                                }, { quoted: message });
                                return;
                            }
                        }

                        const userBanned = await isBanned(senderId);
                        if (userBanned) return;

                        if (foundCommand.strictOwnerOnly) {
                            if (!message.key.fromMe && !isOwnerOrSudoCheck) {
                                return await sock.sendMessage(chatId, { 
                                    text: '❌ This command is only available for the bot owner!',
                                    ...channelInfo 
                                }, { quoted: message });
                            }
                        }

                        if (foundCommand.ownerOnly && !message.key.fromMe && !senderIsOwnerOrSudo) {
                            return await sock.sendMessage(chatId, { 
                                text: '❌ This command is only available for the owner or sudo users!',
                                ...channelInfo 
                            }, { quoted: message });
                        }

                        if (foundCommand.groupOnly && !isGroup) {
                            return await sock.sendMessage(chatId, { 
                                text: 'This command can only be used in groups!',
                                ...channelInfo 
                            }, { quoted: message });
                        }

                        let isSenderAdmin = false;
                        let isBotAdmin = false;

                        if (foundCommand.adminOnly && isGroup) {
                            try {
                                const adminStatus = await isAdmin(sock, chatId, senderId);
                                isSenderAdmin = !!adminStatus.isSenderAdmin;
                                isBotAdmin = !!adminStatus.isBotAdmin;
                            } catch (_) {
                                isSenderAdmin = false;
                                isBotAdmin = false;
                            }
                            if (!isSenderAdmin && !message.key.fromMe && !senderIsOwnerOrSudo) {
                                return await sock.sendMessage(chatId, {
                                    text: '❌ Sirf group admin / owner ye command use kar sakta hai.',
                                    ...channelInfo
                                }, { quoted: message });
                            }
                            if (!isBotAdmin) {
                                return await sock.sendMessage(chatId, {
                                    text: '❌ Bot ko group me *Admin* banao, phir command try karo.',
                                    ...channelInfo
                                }, { quoted: message });
                            }
                        }

                        const syntheticMessage = {
                            key: message.key,
                            message: {
                                extendedTextMessage: {
                                    text: usedPrefix + commandText,
                                    contextInfo: message.message.stickerMessage.contextInfo || {}
                                }
                            },
                            messageTimestamp: message.messageTimestamp,
                            pushName: message.pushName,
                            broadcast: message.broadcast
                        };

                        const context = {
                            chatId,
                            senderId,
                            isGroup,
                            isSenderAdmin,
                            isBotAdmin,
                            senderIsOwnerOrSudo,
                            isOwnerOrSudoCheck,
                            channelInfo,
                            rawText: usedPrefix + commandText,
                            userMessage: (usedPrefix + commandText).toLowerCase(),
                            messageText: usedPrefix + commandText
                        };

                        try {
                            // v2.4.0 speed: reaction ka round-trip handler se pehle await
                            // karna har command ko ~200-500ms slow karta tha. Fire-and-forget.
                            try { if (botVars.isTrue('CMD_REACTION')) { const em = botVars.get('CMD_REACTION_EMOJI') || '⚡'; sock.sendMessage(chatId, { react: { text: em, key: message.key } }).catch(()=>{}); } } catch(_){}
                        try {
                            const sens = require('./sensitive');
                            if (sens.isSensitive(foundCommand, commandText.split(/\s+/)[0]) && !message.key.fromMe && !senderIsOwnerOrSudo) {
                                await sock.sendMessage(chatId, { text: sens.DENY_TEXT }, { quoted: message });
                                return;
                            }
                        } catch (_) {}
                        await foundCommand.handler(styleSock(sock, { useFakeQuote: true, useChannel: true }), syntheticMessage, cmdArgs, context);
                            await addCommandReaction(sock, message);
                            showTypingAfterCommand(sock, chatId).catch(() => {});
                            printLog('success', `✅ Sticker command executed: ${commandText}`);
                        } catch (error) {
                            printLog('error', `❌ Sticker command error [${commandText}]: ${error.message}`);
                            console.error(error.stack); try { if (typeof errorLog !== 'undefined') errorLog.push(String(error.stack), {}); } catch(_e) {}
                            await sock.sendMessage(chatId, {
                                text: `❌ Error executing sticker command: ${error.message}`,
                                ...channelInfo
                            }, { quoted: message });
                        }
                    } else {
                        printLog('warning', `⚠️ Sticker command not found: ${commandText}`);
                    }
                    
                    return;
                }
            }
        }

        // v3.0.0 Voice Mode — voice note ko suno, transcribe karo, text banao
        let viaVoice = false;
        try {
          const vm = require('./voiceMode');
          if (vm.isEnabled() && message.message?.audioMessage?.ptt === true) {
            const heard = await vm.handleVoiceNote(sock, message, { chatId });
            if (heard && heard.text) {
              const heardLower = heard.text.trim().toLowerCase();
              const isCmd = !!commandHandler.getCommand(heardLower, settings.prefixes);
              message.message.conversation = heard.text.trim();
              viaVoice = isCmd;
              if (!isCmd) {
                await sock.sendMessage(chatId, { text: `🎙️ *Suna:* "${heard.text.trim()}"` }, { quoted: message }).catch(() => {});
              }
            } else if (heard && heard.setupNeeded) {
              await sock.sendMessage(chatId, { text: heard.setupNeeded }, { quoted: message }).catch(() => {});
              return;
            } else if (heard && heard.failed) {
              await sock.sendMessage(chatId, { text: `❌ ${heard.error || 'Voice samajh nahi aaya, dobara bolo ya text likho.'}` }, { quoted: message }).catch(() => {});
              return;
            }
          }
        } catch (e) { console.error('[voiceMode]', e.message); }

        const rawText = 
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            message.message?.buttonsResponseMessage?.selectedButtonId ||
            message.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            message.message?.templateButtonReplyMessage?.selectedId ||
            message.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
            '';

        let messageText = rawText.trim();
        // Interactive quick_reply paramsJson → extract id
        try {
            if (message.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
                const pj = message.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson;
                const parsed = typeof pj === 'string' ? JSON.parse(pj) : pj;
                const iid = parsed?.id || parsed?.selectedId || parsed?.cmd || '';
                if (iid) messageText = String(iid).trim();
            }
        } catch (_) {}
        const userMessage = messageText.toLowerCase();
        // v3.1.0 Button Ludo — button taps (ludo_*) ko dispatch se pehle handle karo
        if (userMessage.startsWith('ludo_')) {
          try {
            const ludo = require('./ludoGame');
            if (await ludo.handleButton(sock, message, { chatId, senderId, buttonId: userMessage })) return;
          } catch (e) { console.error('[ludo]', e.message); }
        }

        // Parallel permission checks (faster)
        const [senderIsSudo, senderIsOwnerOrSudo] = await Promise.all([
            isSudo(senderId),
            isOwnerOrSudo(senderId, sock, chatId)
        ]);
        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;

        // Owner detect log (throttled — was spamming console every message)
        if (senderIsOwnerOrSudo) {
            const now = Date.now();
            if (!global.__lastOwnerLog || now - global.__lastOwnerLog > 60000) {
                global.__lastOwnerLog = now;
                printLog('info', `Owner/Sudo active: ${String(senderId).split('@')[0]}`);
            }
        }

        // List / interactive menu2 selections
        {
            const rowId =
                message.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                message.message?.templateButtonReplyMessage?.selectedId ||
                null;
            let flowId = null;
            try {
                const pj = message.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
                if (pj) {
                    const parsed = typeof pj === 'string' ? JSON.parse(pj) : pj;
                    flowId = parsed?.id || parsed?.selectedId || null;
                }
            } catch (_) {}
            const pick = rowId || flowId;
            if (pick && String(pick).startsWith('menu2_')) {
                try {
                    const menu2 = require('../command/menu2');
                    if (menu2.handleListSelection) {
                        await menu2.handleListSelection(styleSock(sock, { useFakeQuote: true, useChannel: true }), message, String(pick));
                        return;
                    }
                } catch (e) {
                    printLog('error', 'menu2 select: ' + (e && e.message));
                }
            }
            // Command button from menu2 grid: id is ".ping" etc → inject as text
            if (pick && /^[.!#/$]/.test(String(pick))) {
                // rewrite message text path by setting a synthetic conversation
                if (!message.message) message.message = {};
                message.message.conversation = String(pick);
            }
        }

        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            printLog('info', `Button response: ${buttonId}`);
            
            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, { 
                    text: '*Join our Channel:*\n[https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J](https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J)' 
                }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                const ownerCommand = require('../command/owner');
                await ownerCommand.handler(styleSock(sock, { useFakeQuote: true, useChannel: true }), message, [], { chatId });
                return;
            } else if (buttonId === 'support') {
                await sock.sendMessage(chatId, { 
                    text: `*Support*\n\nhttps://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J` 
                }, { quoted: message });
                return;
            }
        }

        const userBanned = await isBanned(senderId);
        if (userBanned && !userMessage.startsWith('.unban')) {
            if (Math.random() < 0.1) {
                printLog('warning', `Banned user attempted command: ${senderId.split('@')[0]}`);
                await sock.sendMessage(chatId, {
                    text: 'You are banned from using the bot. Contact an admin to get unbanned.',
                    ...channelInfo
                });
            }
            return;
        }

        if (/^[1-9]$/.test(userMessage) || userMessage === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        if (!message.key.fromMe) {
            await store.incrementMessageCount(chatId, senderId);
        }

        if (isGroup) {
            if (userMessage) {
                await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            }
            await handleLinkDetection(sock, chatId, message, userMessage, senderId);
        }

        if (!isGroup && !message.key.fromMe && !senderIsSudo) {
            try {
                const { readState: readPmBlockerState } = require('../command/pmblocker');
                const pmState = await readPmBlockerState();
                if (pmState.enabled) {
                    printLog('warning', `PM blocked from: ${senderId.split('@')[0]}`);
                    await sock.sendMessage(chatId, { 
                        text: pmState.message || 'Private messages are blocked. Please contact the owner in groups only.' 
                    });
                    await new Promise(r => setTimeout(r, 200));
                    try { 
                        await sock.updateBlockStatus(chatId, 'block');
                        printLog('success', `Blocked user: ${senderId.split('@')[0]}`);
                    } catch (e) {
                        printLog('error', `Failed to block user: ${e.message}`);
                    }
                    return;
                }
            } catch (e) {
                printLog('error', `PM blocker error: ${e.message}`);
            }
        }

        // QUEEN AKUMA generic plugin hooks (afk, autoreply, autorecord, ...)
        
        // Group Anti Engine (antilink, antisticker, antivv, antiforward, ...)
        // v3.6.2: edit events groupAnti se NAHI guzarte — edit koi naya message
        // nahi hai, uska content moderate karne layak nahi; aur antispam tripped
        // (6 msgs / 8s, default ON) hone par edit runHooks (antiedit) tak
        // pahunchta hi nahi tha — user ko lagta tha .antiedit kaam nahi kar raha.
        // Edit ko bypass karne se wo antispam counter me bhi nahi gina jata.
        if (!message._isEditEvent) {
          try {
            const groupAnti = require('./groupAnti');
            const blocked = await groupAnti.processMessage(sock, message, {
              chatId,
              senderId: message.key.participant || message.key.remoteJid,
              messageText: typeof messageText !== 'undefined' ? messageText : ''
            });
            if (blocked) return;
          } catch (e) { console.error('[groupAnti]', e.message); }
        }
        // AI Auto-Admin (v3.2.0) — background check, bot ko slow nahi karta
        try {
          const aiMod = require('./aiMod');
          aiMod.checkMessage(sock, message, { chatId, senderId: message.key.participant || message.key.remoteJid, messageText: typeof messageText !== 'undefined' ? messageText : '', isGroup }).catch(() => {});
        } catch (e) { console.error('[aimod]', e.message); }
        // v3.3.0 Group Summary tracker — har group message ko yaad rakho (memory me, 60 tak)
        try { require('./aiTools').recordGroupMessage(chatId, message.key.participant || message.key.remoteJid, typeof messageText !== 'undefined' ? messageText : ''); } catch (_) {}

        // QUEEN AKUMA quiz games (v2): check answers before anything else
        try {
          const quizGame = require('./quizGame');
          if (await quizGame.checkAnswer(sock, message, { chatId, senderId, messageText, rawText })) return;
        } catch (e) { console.error('[quiz]', e.message); }

        await commandHandler.runHooks('message', sock, message, {
            chatId, senderId, isGroup, userMessage, messageText, rawText, isOwnerOrSudoCheck, senderIsOwnerOrSudo
        });

        // v3.5.0 chat gates (pconly/gconly/swonly/nyimak/restrict/onlyadmin/anticountry)
        try {
          const gates = require('./chatgates');
          if (await gates.shouldBlock({ sock, chatId, isGroup, senderId, isOwnerOrSudoCheck, userMessage })) return;
        } catch (_) {}

        // v3.4.1: edit event ka kaam (antiedit report) hooks me ho gaya — isko command na samjho
        if (message._isEditEvent) return;

        const usedPrefix = settings.prefixes.find(p => userMessage.startsWith(p));

        const command = commandHandler.getCommand(userMessage, settings.prefixes);

        // v3.6.0 SLEEP MODE — sleep me non-owner ke commands chup-chap ignore.
        // Revoke/edit handling, storeMessage, groupAnti aur hooks (runHooks)
        // upar chal chuke hain — ye gate sirf command dispatch rokta hai.
        // Plain text (dexbot/chatbot) command nahi hai, wo chalta rehta hai.
        if (command) {
          try {
            const sleepMode = require('./sleepMode');
            if (sleepMode.isSleeping() && !isOwnerOrSudoCheck && !message.key.fromMe) {
              const cmdName = String((command.command || command.name) || '').toLowerCase();
              const firstArg = (userMessage.replace(/^\S+\s*/, '').split(/\s+/)[0] || '').toLowerCase();
              // .sleepmode off/status — group admin ko aage jaane do (DM me sirf owner)
              let wakeAllowed = false;
              if (cmdName === 'sleepmode' && (firstArg === 'off' || firstArg === 'status' || firstArg === '')) {
                if (isGroup) {
                  try { const st = await require('./isAdmin')(sock, chatId, senderId); wakeAllowed = !!st.isSenderAdmin; } catch (_) {}
                }
              }
              if (!wakeAllowed) return;
            }
          } catch (_) {}
        }

        if (!usedPrefix && !command) {
            handleAutotypingForMessage(sock, chatId, userMessage).catch(() => {});

            // DEXBOT AI (Gemini) — DM and/or group when enabled
            try {
                const handledDex = await handleDexbotMessage(sock, message, userMessage || messageText, chatId, isGroup);
                if (handledDex) return;
            } catch (e) {
                console.error('[dexbot]', e.message); try { if (typeof errorLog !== 'undefined') errorLog.push(String('[dexbot]', e.message), {}); } catch(_e) {}
            }

            if (isGroup) {
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);
                
                const botMode = await getBotModeFast();
                const canUseChatbot = botMode === 'public' || 
                                     (botMode === 'groups' && isGroup) || 
                                     (botMode === 'inbox' && !isGroup) ||
                                     isOwnerOrSudoCheck;
                
                if (canUseChatbot) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                }
            }
            return;
        }

        if (!command) {
            try {
                const handledDex = await handleDexbotMessage(sock, message, userMessage || messageText, chatId, isGroup);
                if (handledDex) return;
            } catch (e) {
                console.error('[dexbot]', e.message); try { if (typeof errorLog !== 'undefined') errorLog.push(String('[dexbot]', e.message), {}); } catch(_e) {}
            }
            if (isGroup) {
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);
                const botMode = await getBotModeFast();
                const canUseChatbot = botMode === 'public' || 
                                     (botMode === 'groups' && isGroup) || 
                                     (botMode === 'inbox' && !isGroup) ||
                                     isOwnerOrSudoCheck;
                
                if (canUseChatbot) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                }
            }
            return;
        }

        const botMode = await getBotModeFast();
        let isAllowed = (() => {
            if (isOwnerOrSudoCheck) return true;
            switch (botMode) {
                case 'public': return true;
                case 'private':
                case 'self': return false;
                case 'groups': return isGroup;
                case 'inbox': return !isGroup;
                default: return true;
            }
        })();

        let tempLimited = false;
        if (!isAllowed && (botMode === 'private' || botMode === 'self')) {
            const acc = resolvePrivateAccess({
                isOwnerOrSudoCheck, senderId, sock, message,
                commandName: command && (command.command || command.name)
            });
            if (acc.allow) {
                isAllowed = true;
                tempLimited = !!acc.limited;
                if (acc.reason === 'temp_grant') {
                    await sock.sendMessage(chatId, {
                        text: `✅ *Temp access* mil gaya (${acc.mins} min)
Limited cmds: .play .song .menu .ping .sticker…
_Owner ke msg pe reply karke unlock hota hai_`
                    }, { quoted: message }).catch(() => {});
                }
            } else {
                await replyPrivateDenied(sock, chatId, message, typeof channelInfo !== 'undefined' ? channelInfo : {});
                return;
            }
        }
        if (!isAllowed) return;

        if (tempLimited) {
            const cn = String((command && (command.command || command.name)) || '').toLowerCase();
            if (!tempAccess.isLimitedCommand(cn)) {
                await sock.sendMessage(chatId, {
                    text: `⏳ Temp access: ye command allowed nahi.\nUse: .play .song .menu .ping .sticker .video\nTime: *${tempAccess.tempRemainingMin(senderId)} min*`
                }, { quoted: message });
                return;
            }
        }

        let args;
        if (usedPrefix) {
            const originalCommandText = messageText.slice(usedPrefix.length).trim();
            args = originalCommandText.split(/\s+/).slice(1);
        } else {
            args = messageText.trim().split(/\s+/).slice(1);
        }

        // Sensitive commands (promote, kick, antilink, owner tools…): owner/sudo only.
        try {
            const sens = require('./sensitive');
            const invoked = (messageText || '').trim().split(/\s+/)[0].replace(/^[^a-zA-Z0-9]+/, '');
            if (sens.isSensitive(command, invoked) && !message.key.fromMe && !senderIsOwnerOrSudo) {
                return await sock.sendMessage(chatId, { text: sens.DENY_TEXT }, { quoted: message });
            }
        } catch (_) {}

        if (command.strictOwnerOnly) {
            if (!message.key.fromMe && !isOwnerOrSudoCheck) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ This command is only available for the bot owner!',
                    ...channelInfo 
                }, { quoted: message });
            }
        }

        if (command.ownerOnly && !message.key.fromMe && !senderIsOwnerOrSudo) {
            return await sock.sendMessage(chatId, { 
                text: '❌ This command is only available for the owner or sudo users!',
                ...channelInfo 
            }, { quoted: message });
        }

        if (command.groupOnly && !isGroup) {
            return await sock.sendMessage(chatId, { 
                text: 'This command can only be used in groups!',
                ...channelInfo 
            }, { quoted: message });
        }
        
        let isSenderAdmin = false;
        let isBotAdmin = false;

        if (command.adminOnly && isGroup) {
            try {
                const adminStatus = await isAdmin(sock, chatId, senderId);
                isSenderAdmin = !!adminStatus.isSenderAdmin;
                isBotAdmin = !!adminStatus.isBotAdmin;
            } catch (e) {
                printLog('error', 'isAdmin: ' + (e && e.message));
                isSenderAdmin = false;
                isBotAdmin = false;
            }

            // Owner / fromMe always allowed past sender-admin check
            if (!isSenderAdmin && !message.key.fromMe && !senderIsOwnerOrSudo) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Sirf group admin / owner ye command use kar sakta hai.',
                    ...channelInfo
                }, { quoted: message });
            }

            if (!isBotAdmin) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Bot ko group me *Admin* banao, phir command try karo.\n\nSettings → Group info → Admins → add bot.',
                    ...channelInfo
                }, { quoted: message });
            }
        }

        // v3.4.1: invoked alias/name (e.g. .demon -> fx) — commands isse apna alias pehchan sakein
        const invokedName = (messageText || '').trim().split(/\s+/)[0].replace(/^[.!#]/, '').toLowerCase();
        const context = {
            chatId,
            senderId,
            isGroup,
            isSenderAdmin,
            isBotAdmin,
            senderIsOwnerOrSudo,
            isOwnerOrSudoCheck,
            channelInfo,
            fakevCard,
            rawText,
            userMessage,
            messageText,
            commandName: invokedName,
            cmd: invokedName
        };

        try {
            const styledSock = styleSock(sock, { useFakeQuote: true, useChannel: true });
            // v3.0.0 Voice Mode — command ka pehla text reply capture karo, voice me bhejo
            let voiceCapture = null;
            let execSock = styledSock;
            if (viaVoice) {
              voiceCapture = { text: '' };
              const baseSend = styledSock.sendMessage.bind(styledSock);
              execSock = Object.create(styledSock);
              execSock.sendMessage = async (jid, content, opts) => {
                if (!voiceCapture.text && content && typeof content.text === 'string' && content.text.trim()) voiceCapture.text = content.text;
                return baseSend(jid, content, opts);
              };
            }
            // v2.5.0: main path ki reaction bhi fire-and-forget (v2.4.0 me sirf
            // sticker path fix hua tha; ye wala await abhi bhi har command ko slow karta tha)
            try { if (botVars.isTrue('CMD_REACTION')) { const em = botVars.get('CMD_REACTION_EMOJI') || '⚡'; sock.sendMessage(chatId, { react: { text: em, key: message.key } }).catch(()=>{}); } } catch(_){}
            await command.handler(execSock, message, args, context);
            try { require('./dashboard').recordCommand(command.command, chatId); } catch (_) {}
            if (viaVoice && voiceCapture && voiceCapture.text) {
              try {
                const vm = require('./voiceMode');
                if (vm.replyVoice()) {
                  const spoken = await vm.speak(voiceCapture.text);
                  if (spoken.ok) {
                    await sock.sendMessage(chatId, { audio: spoken.buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: message });
                  }
                }
              } catch (_) {}
            }
            await addCommandReaction(sock, message);
            showTypingAfterCommand(sock, chatId).catch(() => {});
        } catch (error) {
            printLog('error', `Command error [${command.command}]: ${error.message}`);
            console.error(error.stack);
            
            await sock.sendMessage(chatId, {
                text: `❌ Error executing command: ${error.message}`,
                ...channelInfo
            }, { quoted: message });

            const errorLog = {
                command: command.command,
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                user: senderId,
                chat: chatId
            };
            
            try {
                fs.appendFileSync('./error.log', JSON.stringify(errorLog) + '\n');
                printLog('info', 'Error logged to file');
            } catch (e) {
                printLog('error', `Failed to write error log: ${e.message}`);
            }
        }

    } catch (error) {
        printLog('error', `Message handler error: ${error.message}`);
        console.error(error.stack);
        
        const chatId = messageUpdate.messages?.[0]?.key?.remoteJid;
        if (chatId) {
            try {
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to process message!',
                    ...channelInfo
                });
            } catch (e) {
                printLog('error', `Failed to send error message: ${e.message}`);
            }
        }
    }
 }


async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;
        if (!id.endsWith('@g.us')) return;

        printLog('info', `Group update: ${action} in ${id.split('@')[0]}`);
        await commandHandler.runHooks('group', sock, update);

        const botMode = await getBotModeFast();
        const isPublicMode = botMode === 'public' || botMode === 'groups';

        switch (action) {
            case 'promote':
                if (!isPublicMode) return;
                if (participants && participants.length > 0) {
                    const participant = Array.isArray(participants) ? participants[0] : participants;
                    printLog('success', `User promoted: ${typeof participant === 'string' ? participant.split('@')[0] : 'unknown'}`);
                }
                const { handlePromotionEvent } = require('../command/promote');
                await handlePromotionEvent(sock, id, participants, author);
                break;

            case 'demote':
                if (!isPublicMode) return;
                if (participants && participants.length > 0) {
                    const participant = Array.isArray(participants) ? participants[0] : participants;
                    printLog('warning', `User demoted: ${typeof participant === 'string' ? participant.split('@')[0] : 'unknown'}`);
                }
                const { handleDemotionEvent } = require('../command/demote');
                await handleDemotionEvent(sock, id, participants, author);
                break;

            case 'add':
                if (participants && participants.length > 0) {
                    const participant = Array.isArray(participants) ? participants[0] : participants;
                    printLog('success', `User joined: ${typeof participant === 'string' ? participant.split('@')[0] : 'unknown'}`);
                }
                const { handleJoinEvent } = require('../command/welcome');
                await handleJoinEvent(sock, id, participants);
                break;

            case 'remove':
                if (participants && participants.length > 0) {
                    const participant = Array.isArray(participants) ? participants[0] : participants;
                    printLog('info', `User left: ${typeof participant === 'string' ? participant.split('@')[0] : 'unknown'}`);
                }
                const { handleLeaveEvent } = require('../command/goodbye');
                await handleLeaveEvent(sock, id, participants);
                break;

            default:
                printLog('warning', `Unhandled group action: ${action}`);
        }
    } catch (error) {
        printLog('error', `Group update error: ${error.message}`);
        console.error(error.stack);
    }
}

async function handleStatus(sock, status) {
    try {
        const { handleStatusUpdate } = require('../command/autostatus');
        await handleStatusUpdate(sock, status);
    } catch (error) {
        printLog('error', `Status handler error: ${error.message}`);
        console.error(error.stack);
    }
}

async function handleCall(sock, calls) {
    try {
        const anticallPlugin = require('../command/anticall');
        const state = anticallPlugin.readState ? await anticallPlugin.readState() : { enabled: false };
        if (!state.enabled) return;

        const antiCallNotified = new Set();

        for (const call of calls) {
            const callerJid = call.from || call.peerJid || call.chatId;
            if (!callerJid) continue;

            printLog('warning', `Incoming call from: ${callerJid.split('@')[0]}`);

            try {
                try {
                    if (typeof sock.rejectCall === 'function' && call.id) {
                        await sock.rejectCall(call.id, callerJid);
                        printLog('success', `Call rejected: ${callerJid.split('@')[0]}`);
                    } else if (typeof sock.sendCallOfferAck === 'function' && call.id) {
                        await sock.sendCallOfferAck(call.id, callerJid, 'reject');
                        printLog('success', `Call rejected: ${callerJid.split('@')[0]}`);
                    }
                } catch (e) {
                    printLog('error', `Error rejecting call: ${e.message}`);
                }

                if (!antiCallNotified.has(callerJid)) {
                    antiCallNotified.add(callerJid);
                    setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                    
                    await sock.sendMessage(callerJid, { 
                        text: '📵 Anticall is enabled. Your call was rejected and you will be blocked.' 
                    });
                    printLog('info', `Sent anticall warning to: ${callerJid.split('@')[0]}`);
                }

                setTimeout(async () => {
                    try { 
                        await sock.updateBlockStatus(callerJid, 'block');
                        printLog('success', `Blocked caller: ${callerJid.split('@')[0]}`);
                    } catch (e) {
                        printLog('error', `Error blocking caller: ${e.message}`);
                    }
                }, 300);

            } catch (error) {
                printLog('error', `Error handling call from ${callerJid.split('@')[0]}: ${error.message}`);
            }
        }
    } catch (error) {
        printLog('error', `Call handler error: ${error.message}`);
        console.error(error.stack);
    }
}

module.exports.clearBotModeCache = clearBotModeCache;
module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus,
    handleCall
};

