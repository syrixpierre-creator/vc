/*****************************************************************************
 *                                                                           *
 *                QUEEN AKUMA  •  MADE BY INCONNU BOY SENSEI                 *
 *                                                                           *
 *  📢  Channel : INCONNU BOY SENSEI                                         *
 *  🔗  Link    : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J      *
 *                                                                           *
 *****************************************************************************/

/**
 * QUEEN AKUMA v3.5.0 — .stoprent REWORKED.
 * Pehle: sirf global.conns index se chalta tha — restart ke baad conns
 * khaali hota tha to "No sub-bots running" bol deta tha, aur number se
 * stop karne ka option hi nahi tha.
 * Ab: lib/cloneRent.listAllClones() (wahi order jo .listrent/.rentlist me
 * hai) — number, list-index, ya 'all' se stop karo. Stop karne par rent
 * record history me chala jata hai (.rentexpired se dekho).
 */
const rentLib = require('../lib/cloneRent');
const fs = require('fs');
const path = require('path');

async function stopOne(entry) {
    let stopped = false;
    try {
        const conn = entry.conn || (global.conns || []).find((c) => rentLib.matchNumber(rentLib.normNumber(String(((c && c.user) || {}).id || '').split(':')[0]), entry.number));
        if (conn) {
            try { await conn.logout(); } catch (e) {}
            try { conn.end(); } catch (e) {}
            const i = (global.conns || []).indexOf(conn);
            if (i > -1) global.conns.splice(i, 1);
            stopped = true;
        }
    } catch (e) {}
    // Session folder hatao (logout ke baad creds bekaar hain).
    try {
        if (entry.authId) {
            const dir = path.join(process.cwd(), 'session', 'clones', entry.authId);
            if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
        }
    } catch (e) {}
    rentLib.closeRecord(entry.number, 'stopped');
    return stopped;
}

module.exports = {
    command: 'stoprent',
    aliases: ['stopclone', 'delrent'],
    category: 'owner',
    description: 'Stop a sub-bot by number, list index, or all',
    usage: '.stoprent [number/index/all]',
    ownerOnly: 'true',

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;
        const list = rentLib.listAllClones();

        if (list.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ No sub-bots are currently running or stored."
            }, { quoted: message });
        }

        if (!args[0]) {
            return await sock.sendMessage(chatId, {
                text: `📌 *Usage:* .stoprent <number | index | all>`
            }, { quoted: message });
        }

        if (args[0].toLowerCase() === 'all') {
            let stoppedCount = 0;
            for (const entry of list) {
                try {
                    if (await stopOne(entry)) stoppedCount++;
                } catch (e) {}
            }
            return await sock.sendMessage(chatId, {
                text: `✅ *All sub-bots stopped.* (${stoppedCount}/${list.length})`
            }, { quoted: message });
        }

        const target = rentLib.resolveTarget(args[0], list);
        if (!target) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid number/index. Check `.listrent` first."
            }, { quoted: message });
        }

        const wasOnline = !!target.online;
        await stopOne(target);
        await sock.sendMessage(chatId, {
            text: `✅ Stopped and removed sub-bot: @${target.number}${target.name ? ' (' + target.name + ')' : ''}\n\n` +
                  `Pehle status: ${wasOnline ? 'Online' : 'Offline'}\n` +
                  ``,
            mentions: [target.number + '@s.whatsapp.net']
        }, { quoted: message });
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
