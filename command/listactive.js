// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'listonline',
    aliases: ['active', 'here', 'whoisonline', 'onlinelist'],
    category: 'group',
    description: 'List online users in the group',
    usage: '.listonline',
    groupOnly: true,
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        try {
            // Send reaction
            await sock.sendMessage(chatId, {
                react: { text: '👀', key: message.key }
            }).catch(() => {});

            // Get group metadata
            let meta = null;
            try {
                meta = await sock.groupMetadata(chatId);
            } catch (err) {
                console.error('[metadata]', err.message);
                await sock.sendMessage(chatId, {
                    text: '❌ Cannot fetch group info'
                }, { quoted: fakeSender });
                return;
            }

            if (!meta?.participants || meta.participants.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '👥 No participants found in this group.'
                }, { quoted: fakeSender });
                return;
            }

            // Send initial processing message
            await sock.sendMessage(chatId, {
                text: '🟢 *Checking online members...*\n_Please wait a moment_'
            }, { quoted: fakeSender });

            const onlineMembers = new Set();

            // Subscribe to presence updates for all participants
            const presencePromises = [];
            for (const participant of meta.participants) {
                const jid = participant.id;
                if (!jid) continue;
                presencePromises.push(
                    sock.presenceSubscribe(jid).catch(() => {})
                );
            }
            await Promise.allSettled(presencePromises);

            // Wait for presence data to populate
            await new Promise(r => setTimeout(r, 3000));

            // Presence update handler
            const presenceHandler = (update) => {
                try {
                    if (update?.presences) {
                        for (const [jid, data] of Object.entries(update.presences)) {
                            const presence = data?.lastKnownPresence;
                            // Check all possible online states
                            if (['available', 'composing', 'recording'].includes(presence)) {
                                onlineMembers.add(jid);
                            }
                        }
                    }
                } catch (err) {
                    console.error('[presenceHandler]', err);
                }
            };

            // Subscribe to presence events
            sock.ev.on('presence.update', presenceHandler);

            // Do multiple checks for better detection
            const maxChecks = 3;
            let checkCount = 0;
            let checkDone = false;

            const checkOnline = async () => {
                checkCount++;

                // Also check from store
                if (sock.store?.presences) {
                    const presences = sock.store.presences;
                    for (const [jid, data] of Object.entries(presences)) {
                        if (data?.lastKnownPresence &&
                            ['available', 'composing', 'recording'].includes(data.lastKnownPresence)) {
                            onlineMembers.add(jid);
                        }
                    }
                }

                if (checkCount >= maxChecks && !checkDone) {
                    checkDone = true;
                    sock.ev.off('presence.update', presenceHandler);
                    clearInterval(interval);

                    // Final check from store
                    if (sock.store?.presences) {
                        const presences = sock.store.presences;
                        for (const [jid, data] of Object.entries(presences)) {
                            if (data?.lastKnownPresence &&
                                ['available', 'composing', 'recording'].includes(data.lastKnownPresence)) {
                                onlineMembers.add(jid);
                            }
                        }
                    }

                    // Send presence update to get more data
                    try {
                        await sock.sendPresenceUpdate('composing', chatId);
                    } catch {}

                    // Wait one more moment
                    await new Promise(r => setTimeout(r, 1000));

                    // Final check
                    if (sock.store?.presences) {
                        const presences = sock.store.presences;
                        for (const [jid, data] of Object.entries(presences)) {
                            if (data?.lastKnownPresence &&
                                ['available', 'composing', 'recording'].includes(data.lastKnownPresence)) {
                                onlineMembers.add(jid);
                            }
                        }
                    }

                    // Also check participants who are online but might not be in presences
                    for (const p of meta.participants) {
                        const jid = p.id;
                        if (!jid) continue;
                        try {
                            // Try to check if they're online by sending a presence update
                            await sock.sendPresenceUpdate('composing', jid).catch(() => {});
                        } catch {}
                    }

                    // Wait final moment
                    await new Promise(r => setTimeout(r, 1000));

                    // One final check from store
                    if (sock.store?.presences) {
                        const presences = sock.store.presences;
                        for (const [jid, data] of Object.entries(presences)) {
                            if (data?.lastKnownPresence &&
                                ['available', 'composing', 'recording'].includes(data.lastKnownPresence)) {
                                onlineMembers.add(jid);
                            }
                        }
                    }

                    const onlineArray = Array.from(onlineMembers);
                    const total = meta.participants.length;
                    const onlineCount = onlineArray.length;
                    const offlineCount = total - onlineCount;

                    // Build status bar
                    const barLength = 20;
                    const filled = Math.round((onlineCount / total) * barLength);
                    const bar = ''.repeat(filled) + ''.repeat(barLength - filled);

                    // Get admin count
                    const admins = meta.participants.filter(p => p.admin);
                    const adminCount = admins.length;

                    // Build response
                    let text = ` ⟮ 👀 ${botName} ⟯⊷\n`;
                    text += ` *ONLINE USERS*\n`;
                    text += `\n`;
                    text += ` 📊 Status: [${bar}]\n`;
                    text += ` 👥 Total: *${total}* members\n`;
                    text += ` 🟢 Online: *${onlineCount}*\n`;
                    text += ` 🔴 Offline: *${offlineCount}*\n`;
                    text += ` 👑 Admins: *${adminCount}*\n`;
                    text += `\n`;

                    if (onlineCount > 0) {
                        text += ` 🟢 *Online Members:*\n`;

                        // Sort online users by presence status (composing > recording > available)
                        onlineArray.sort((a, b) => {
                            const statusA = sock.store?.presences?.[a]?.lastKnownPresence || '';
                            const statusB = sock.store?.presences?.[b]?.lastKnownPresence || '';
                            const order = { composing: 0, recording: 1, available: 2 };
                            return (order[statusA] || 3) - (order[statusB] || 3);
                        });

                        const maxDisplay = 25;
                        const displayList = onlineArray.slice(0, maxDisplay);

                        for (const jid of displayList) {
                            const name = jid.split('@')[0];
                            const status = sock.store?.presences?.[jid]?.lastKnownPresence || 'available';
                            const icon = status === 'composing' ? '✍️' :
                                        status === 'recording' ? '🎙️' : '🟢';
                            const statusLabel = status === 'composing' ? 'typing...' :
                                               status === 'recording' ? 'recording...' : '';
                            text += `\n ${icon} @${name} ${statusLabel ? '· ' + statusLabel : ''}`;
                        }

                        if (onlineCount > maxDisplay) {
                            text += `\n\n _...and ${onlineCount - maxDisplay} more online_`;
                        }
                    } else {
                        text += ` 📭 *No one is online right now.*`;
                    }

                    text += `\n⊷\n\n`;
                    text += `_⚡ Powered by ${botName}_`;

                    await sock.sendMessage(chatId, {
                        text: text,
                        mentions: onlineArray
                    }, { quoted: fakeSender });

                    // Success reaction
                    await sock.sendMessage(chatId, {
                        react: { text: '✅', key: message.key }
                    }).catch(() => {});
                }
            };

            const interval = setInterval(checkOnline, 2000);

        } catch (err) {
            console.error('[listonline]', err.message);
            await sock.sendMessage(chatId, {
                text: `❌ Error checking online users: ${err.message || 'Unknown error'}`
            }, { quoted: fakeSender });

            await sock.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            }).catch(() => {});
        }
    }
};