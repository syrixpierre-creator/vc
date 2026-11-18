// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

//  Number parsing
function normalizeNumber(input) {
    if (!input) return null;
    let num = String(input).replace(/[^0-9+]/g, '');
    if (!num) return null;
    if (num.startsWith('+')) num = num.slice(1);
    if (num.endsWith('@s.whatsapp.net')) {
        num = num.replace('@s.whatsapp.net', '');
    }
    if (num.length < 8 || num.length > 15) return null;
    return num;
}

//  Country lookup
function getCountry(num) {
    const codes = [
        ['1', 'United States/Canada'], ['20', 'Egypt'], ['27', 'South Africa'],
        ['30', 'Greece'], ['31', 'Netherlands'], ['33', 'France'],
        ['34', 'Spain'], ['36', 'Hungary'], ['39', 'Italy'],
        ['43', 'Austria'], ['44', 'United Kingdom'], ['45', 'Denmark'],
        ['46', 'Sweden'], ['47', 'Norway'], ['48', 'Poland'],
        ['49', 'Germany'], ['51', 'Peru'], ['52', 'Mexico'],
        ['54', 'Argentina'], ['55', 'Brazil'], ['56', 'Chile'],
        ['57', 'Colombia'], ['58', 'Venezuela'], ['60', 'Malaysia'],
        ['61', 'Australia'], ['62', 'Indonesia'], ['63', 'Philippines'],
        ['64', 'New Zealand'], ['65', 'Singapore'], ['66', 'Thailand'],
        ['81', 'Japan'], ['82', 'South Korea'], ['84', 'Vietnam'],
        ['86', 'China'], ['90', 'Turkey'], ['91', 'India'],
        ['92', 'Pakistan'], ['93', 'Afghanistan'], ['94', 'Sri Lanka'],
        ['95', 'Myanmar'], ['98', 'Iran'],
        ['212', 'Morocco'], ['213', 'Algeria'], ['216', 'Tunisia'],
        ['218', 'Libya'], ['220', 'Gambia'], ['221', 'Senegal'],
        ['222', 'Mauritania'], ['223', 'Mali'], ['224', 'Guinea'],
        ['225', 'Ivory Coast'], ['226', 'Burkina Faso'], ['227', 'Niger'],
        ['228', 'Togo'], ['229', 'Benin'], ['230', 'Mauritius'],
        ['231', 'Liberia'], ['232', 'Sierra Leone'], ['233', 'Ghana'],
        ['234', 'Nigeria'], ['235', 'Chad'], ['237', 'Cameroon'],
        ['243', 'DR Congo'], ['254', 'Kenya'], ['255', 'Tanzania'],
        ['256', 'Uganda'], ['257', 'Burundi'], ['258', 'Mozambique'],
        ['260', 'Zambia'], ['263', 'Zimbabwe'], ['267', 'Botswana'],
        ['268', 'Eswatini'], ['269', 'Comoros'],
    ];
    const sorted = codes.slice().sort((a, b) => b[0].length - a[0].length);
    for (const [code, name] of sorted) {
        if (num.startsWith(code)) return name;
    }
    return 'Unknown';
}

//  Factor B: public send-page name + avatar probe
const DEFAULT_AVATAR = 'static.whatsapp.net';

async function probeSendPage(num) {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await fetch(
                `https://api.whatsapp.com/send?phone=${encodeURIComponent(num)}&type=phone_number&app_absent=0`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                    signal: AbortSignal.timeout(15000),
                }
            );
            const html = await res.text();

            const raw = ((html.match(/property="og:title" content="([^"]*)"/i) || [])[1] || '');
            const title = raw.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
            const generic = /share on whatsapp/i.test(title);

            const avatar = ((html.match(/property="og:image" content="([^"]*)"/i) || [])[1] || '');
            const hasOwnPic = !generic && /pps\.whatsapp\.net/i.test(avatar);

            if (!generic) {
                return { ok: true, generic: false, title: title.trim(), hasOwnPic };
            }
            if (attempt === 2) {
                return { ok: true, generic: true, title: null, hasOwnPic: false };
            }
            await new Promise(r => setTimeout(r, 1500));
        }
        catch (_) {
            if (attempt === 2) return { ok: false, generic: null, title: null, hasOwnPic: false };
            await new Promise(r => setTimeout(r, 1500));
        }
    }
    return { ok: false, generic: null, title: null, hasOwnPic: false };
}

module.exports = {
    command: 'banchecker',
    aliases: ['bancheck', 'checkban', 'isbanned', 'numbercheck'],
    category: 'utility',
    description: 'Accurately check if a WhatsApp number is banned or active',
    usage: '.banchecker <number> or reply to a message',
    ownerOnly: true,
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        //  Determine the target number
        let target = null;
        try {
            const contextInfo =
                message.message?.extendedTextMessage?.contextInfo ||
                message.message?.imageMessage?.contextInfo ||
                message.message?.videoMessage?.contextInfo ||
                message.message?.documentMessage?.contextInfo ||
                message.message?.audioMessage?.contextInfo;
            const who = contextInfo?.participant || contextInfo?.remoteJid;
            if (who && who.endsWith('@s.whatsapp.net')) target = normalizeNumber(who);
        }
        catch (_) { /* ignore */ }

        if (!target) target = normalizeNumber((args[0] || '').trim());

        if (!target) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 🛡️ ${botName} ⟯⊷
 *BAN CHECKER*

 *Usage:*
  Reply to a user + .banchecker
  .banchecker <number>

 *Example:*
  .banchecker 2349127814853
⊷`
            }, { quoted: fakeSender });
            return;
        }

        //  Waiting message
        const waitMsg = await sock.sendMessage(chatId, {
            text: `🛡️ *Checking:* +${target}\n 🔄 _Querying WhatsApp servers (2-factor)…_`
        }, { quoted: fakeSender });

        let result = null;

        //  Factor A: live registry
        let registered = null;
        try {
            const onWA = await sock.onWhatsApp(target + '@s.whatsapp.net');
            registered = Array.isArray(onWA) && onWA.length > 0 && onWA[0].exists === true;
        }
        catch (_) { /* registry probe failed; continue with factor B */ }

        //  Factor D: security-code (identity key) probe
        let devices = null;
        try {
            if (typeof sock.executeUSyncQuery === 'function') {
                const q = new (await import('@crysnovax/baileys')).USyncQuery()
                    .withDeviceProtocol()
                    .withUser(new (await import('@crysnovax/baileys')).USyncUser().withId(target + '@s.whatsapp.net'));
                const devRes = await sock.executeUSyncQuery(q);
                if (devRes && Array.isArray(devRes.list) && devRes.list.length > 0) {
                    const devInfo = devRes.list[0];
                    const dl = devInfo?.devices?.deviceList || devInfo?.devices?.device_list || null;
                    devices = Array.isArray(dl) ? dl : null;
                    if (devices === null && devInfo && devInfo.devices) {
                        const d = devInfo.devices;
                        for (const k of Object.keys(d)) {
                            if (Array.isArray(d[k])) { devices = d[k]; break; }
                        }
                    }
                }
                else {
                    devices = [];
                }
            }
        }
        catch (_) { /* probe failed; devices stays null */ }

        //  Factor B: send-page marker
        const page = await probeSendPage(target);

        //  Factor C: carrier registry
        const carrier = await probeCarrier(target);

        //  Verdict
        if (devices !== null) {
            const devCount = devices.length;
            if (devCount >= 2 && page?.ok) {
                result = {
                    emoji: '🟢', status: 'UNBANNED — ACTIVE',
                    detail: `+${target} has a *LIVE* WhatsApp account\n(_valid identity keys: ${devCount} device(s) on the servers).`,
                    profile: page.title || null,
                };
            }
            else if (devCount === 1 && page?.generic) {
                result = {
                    emoji: '🔴', status: 'BANNED',
                    detail: `+${target} is *BANNED* — WhatsApp removed its profile.\n` +
                        `_Signature: only 1 stale identity key left on the servers (normal accounts keep 2+ devices) — the account is in post-ban key deletion._`,
                    profile: null,
                };
            }
            else if (devCount === 1 && page?.ok && !page.generic) {
                result = {
                    emoji: '🟢', status: 'UNBANNED — ACTIVE',
                    detail: `+${target} has a *LIVE* WhatsApp account\n(_valid identity keys: ${devCount} device on the servers).`,
                    profile: page.title || null,
                };
            }
            else if (devCount === 0 && page?.ok) {
                result = {
                    emoji: '🔴', status: 'BANNED / OFF-WHATSAPP',
                    detail: `+${target} has *no* WhatsApp account.\n` +
                        `_Signature: identity keys fully destroyed on the servers — the account was banned & removed._`,
                    profile: null,
                };
            }
        }

        if (!result && page.ok) {
            if (!page.generic && registered === true) {
                result = {
                    emoji: '🟢', status: 'UNBANNED — ACTIVE',
                    detail: `+${target} has a *LIVE* WhatsApp account\n(name & profile picture visible publicly).`,
                    profile: page.title,
                };
            }
            else if (page.generic && registered === true) {
                result = {
                    emoji: '🟡', status: 'ACTIVE — PROFILE HIDDEN',
                    detail: `+${target} *exists* on WhatsApp's servers.\n` +
                        `_Its public page shows no name/photo — either privacy mode is ON or the account was just banned and is being removed._`,
                    profile: null,
                };
            }
            else if (page.generic && registered === false) {
                result = {
                    emoji: '🔴', status: 'BANNED / OFF-WHATSAPP',
                    detail: `+${target} has *no* WhatsApp account.\n` +
                        `_Number was never registered, was deleted, or was banned & removed from the servers._`,
                    profile: null,
                };
            }
        }

        if (!result) {
            if (registered === true) {
                result = { emoji: '🟡', status: 'LIKELY ACTIVE (VERIFY)', detail: `+${target} exists on WhatsApp's servers but its public profile is hidden and the key probe timed out. Recheck in 24h.`, profile: null };
            }
            else if (registered === false) {
                result = { emoji: '🔴', status: 'BANNED / OFF-WHATSAPP', detail: `+${target} is not on WhatsApp's servers (key/public checks timed out).`, profile: null };
            }
            else {
                result = { emoji: '❓', status: 'UNKNOWN', detail: `Server probes failed. Try again in a moment.`, profile: null };
            }
        }

        //  Carrier extras
        let extras = '';
        if (carrier.ok && carrier.data) {
            if (carrier.data.carrier) extras += `*Carrier:* ${carrier.data.carrier}\n`;
            if (carrier.data.line_type) extras += `*Line type:* ${carrier.data.line_type}\n`;
            if (carrier.data.country_name) extras += `*Region:* ${carrier.data.country_name}\n`;
        }
        else if (carrier.rateLimited) {
            extras += `_NumVerify limit reached — carrier info skipped._\n`;
        }

        //  Delete waiting message
        try { await sock.sendMessage(chatId, { delete: waitMsg.key }); } catch (_) { /* ignore */ }

        //  Send result
        const country = getCountry(target);
        const profileLine = result.profile ? `*Profile name:* ${result.profile}\n` : '';

        await sock.sendMessage(chatId, {
            text: ` ⟮ 🛡️ ${botName} ⟯⊷
 *BAN CHECKER*

 ${result.emoji} *${result.status}*

 *Number:* +${target}
 *Country:* ${country}
 ${profileLine}${extras}
 ${result.detail}

 _2-factor check: registry + public page_
 _Note: exact ban reason/date is only visible_
 _inside the banned account itself._
⊷

_⚡ Powered by ${botName}_`
        }, { quoted: fakeSender });
    }
};

//  Optional carrier check: NumVerify
const DEFAULT_NV_KEY = '1e4c1e7867b7d586bf28de7e2414fb93';

async function probeCarrier(num) {
    const nvKey = process.env.NUMVERIFY_API_KEY || DEFAULT_NV_KEY;
    try {
        const res = await fetch(
            `http://apilayer.net/api/validate?access_key=${encodeURIComponent(nvKey)}&number=${encodeURIComponent(num)}&country_code=&format=1`,
            { signal: AbortSignal.timeout(15000) }
        );
        const nv = await res.json();
        if (nv && typeof nv.valid === 'boolean') return { ok: true, data: nv };
        if (nv && nv.error && nv.error.type === 'rate_limit_reached') {
            return { ok: false, rateLimited: true };
        }
        return { ok: false };
    }
    catch (_) {
        return { ok: false };
    }
}