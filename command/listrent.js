/*****************************************************************************
 *                                                                           *
 *                QUEEN AKUMA  •  MADE BY INCONNU BOY SENSEI                 *
 *                                                                           *
 *  📢  Channel : INCONNU BOY SENSEI                                         *
 *  🔗  Link    : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J      *
 *                                                                           *
 *****************************************************************************/

/**
 * QUEEN AKUMA v3.5.0 — .listrent (clone list) REWORKED.
 * Pehle: file hosting par stored (offline) clones kabhi dikhte hi nahi the
 * (stored section sirf DB env me chalta tha), aur session.json file-hosting
 * par banti hi nahi thi — restart ke baad list khaali dikhti thi.
 * Ab: lib/cloneRent.listAllClones() — online conns + disk sessions
 * (creds.json se number) + rent records, ek hi unified list. Yehi order
 * .rentlist aur .stoprent me bhi hai, taaki index number har jagah same rahe.
 */
const rentLib = require('../lib/cloneRent');

module.exports = {
    command: 'listrent',
    aliases: ['listclone', 'botclones'],
    category: 'owner',
    description: 'List all currently active sub-bots (with rent info)',
    ownerOnly: true,
    usage: '.listrent',

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;

        const list = rentLib.listAllClones();

        if (list.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ *No sub-bots are active or stored.*"
            }, { quoted: message });
        }

        const online = list.filter((e) => e.online).length;
        let msg = `* [ CLONE BOTS ] *\n\n`;
        msg += `*Total:* ${list.length}  •  *🟢 Online:* ${online}\n\n`;

        list.forEach((e, i) => {
            msg += `*${i + 1}.* @${e.number}`;
            if (e.name) msg += ` (${e.name})`;
            msg += `\n`;
            msg += `    Status: ${e.online ? 'Connected ✅' : (e.rent ? 'Offline (rent active)' : (e.authId ? 'Offline (stored)' : 'Offline'))}\n`;
            if (e.rent) {
                msg += `    💰 Price: ${rentLib.fmtPrice(e.rent.price)}\n`;
                msg += `    ⏰ Expires: ${rentLib.fmtDateIST(e.rent.expiresAt)}${e.rent.expiresAt ? ' (' + rentLib.fmtRemaining(e.rent.expiresAt - Date.now()) + ')' : ' — unlimited'}\n`;
            } else {
                msg += `    💰 No rent record\n`;
            }
            msg += `\n`;
        });

        msg += `Rent manage karo: .rentlist / .rentadd / .rentremove / .rentinfo / .rentextend / .rentstats`;

        const mentions = list.map((e) => e.number + '@s.whatsapp.net');

        await sock.sendMessage(chatId, {
            text: msg,
            mentions: mentions
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
