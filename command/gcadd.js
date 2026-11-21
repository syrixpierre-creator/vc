/*****************************************************************************
 *                                                                           *
 *                QUEEN AKUMA  •  MADE BY INCONNU BOY SENSEI                 *
 *                                                                           *
 *  📢  Channel : INCONNU BOY SENSEI                                         *
 *  🔗  Link    : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J      *
 *                                                                           *
 *****************************************************************************/


module.exports = {
    command: 'add',
    aliases: ['invite', 'gcadd', 'addgc'],
    category: 'group',
    description: 'Add a user to the group',
    usage: '.add <number> or reply to vcard/message',
    groupOnly: 'true',
    adminOnly: 'true',

    async handler(sock, message, args, context = {}) {
        const { chatId, channelInfo } = context;

        let targetNumber = null;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
            const quotedParticipant = message.message.extendedTextMessage.contextInfo.participant;

            if (quotedMsg.contactMessage) {
                const vcard = quotedMsg.contactMessage.vcard;
                const phoneMatch = vcard.match(/waid=(\d+)/);
                if (phoneMatch) {
                    targetNumber = phoneMatch[1];
                } else {
                    const telMatch = vcard.match(/TEL.*?:(\+?\d+)/);
                    if (telMatch) {
                        targetNumber = telMatch[1].replace(/\D/g, '');
                    }
                }
            }
            else if (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text) {
                const text = quotedMsg.conversation || quotedMsg.extendedTextMessage.text;
                const numberMatch = text.match(/(\+?\d{10,15})/);
                if (numberMatch) {
                    targetNumber = numberMatch[1].replace(/\D/g, '');
                }
            }
            else if (quotedParticipant) {
                targetNumber = quotedParticipant.split('@')[0];
            }
        }

        if (!targetNumber && args.length > 0) {
            const input = args.join(' ');
            const cleaned = input.replace(/[^\d+]/g, '');
            targetNumber = cleaned.replace(/^\+/, '');
        }

        if (!targetNumber) {
            return await sock.sendMessage(chatId, {
                text: '📌 *Usage:* .add 5544xxxxxxxxx',
                ...channelInfo
            }, { quoted: message });
        }

        if (!targetNumber.startsWith('1') && !targetNumber.startsWith('2') && !targetNumber.startsWith('3') &&
            !targetNumber.startsWith('4') && !targetNumber.startsWith('5') && !targetNumber.startsWith('6') &&
            !targetNumber.startsWith('7') && !targetNumber.startsWith('8') && !targetNumber.startsWith('9')) {
            return await sock.sendMessage(chatId, {
                text: '❌ *Invalid number!*',
                ...channelInfo
            }, { quoted: message });
        }

        const targetJid = `${targetNumber}@s.whatsapp.net`;

        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants.map(p => p.id);

            if (participants.includes(targetJid)) {
                return await sock.sendMessage(chatId, {
                    text: '❌ *User is already in the group!*',
                    ...channelInfo
                }, { quoted: message });
            }

            const result = await sock.groupParticipantsUpdate(
                chatId,
                [targetJid],
                'add'
            );

            if (result[0].status === '200') {
                await sock.sendMessage(chatId, {
                    text: `✅ *Member added:* @${targetNumber}`,
                    mentions: [targetJid],
                    ...channelInfo
                }, { quoted: message });
            } else if (result[0].status === '403') {
                await sock.sendMessage(chatId, {
                    text: '❌ *Failed to add member* (privacy settings)',
                    ...channelInfo
                }, { quoted: message });
            } else if (result[0].status === '408') {
                await sock.sendMessage(chatId, {
                    text: '✅ *Invite sent*',
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ *Failed to add member*',
                    ...channelInfo
                }, { quoted: message });
            }

        } catch (error) {
            console.error('Add command error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ *Failed to add member*\nError: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

/*****************************************************************************
 *                                                                           *
 *                QUEEN AKUMA  •  MADE BY INCONNU BOY SENSEI                 *
 *                                                                           *
 *  📢  Channel : INCONNU BOY SENSEI                                         *
 *  🔗  Link    : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J      *
 *                                                                           *
 *****************************************************************************/


