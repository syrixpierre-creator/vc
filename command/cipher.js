// Caesar, Vigenere, or XOR cipher — pure JS (no helper binary needed).
// Pehle ye ek compiled helper binary (temp/bin/cipher) ko exec karta tha jo
// repo me kabhi ship hi nahi hua — isliye .cipher/.encode hamesha fail hota tha.
// Ab teeno cipher pure JS me hain, same interface + same reply format.
module.exports = {
    command: 'cipher',
    aliases: ['encrypt', 'decrypt', 'encode', 'crypt'],
    category: 'utility',
    description: 'Encrypt or decrypt text using Caesar, Vigenere, or XOR cipher',
    usage: '.cipher <type> <encode|decode> <key> <text>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        if (args.length < 4) {
            return await sock.sendMessage(chatId, {
                text: `🔐 *Text Cipher*\n\n` +
                    `*Usage:* \`.cipher <type> <encode|decode> <key> <text>\`\n\n` +
                    `*Cipher types:*\n\n` +
                    `*caesar* — shift letters by a number (key = number)\n` +
                    `• \`.cipher caesar encode 13 Hello World\`\n` +
                    `• \`.cipher caesar decode 13 Uryyb Jbeyq\`\n\n` +
                    `*vigenere* — polyalphabetic cipher (key = word)\n` +
                    `• \`.cipher vigenere encode SECRET Hello World\`\n` +
                    `• \`.cipher vigenere decode SECRET Zincs Pgvnu\`\n\n` +
                    `*xor* — XOR byte cipher, output is hex (key = any text)\n` +
                    `• \`.cipher xor encode mykey Hello\`\n` +
                    `• \`.cipher xor decode mykey 25090a0e06\``,
                ...channelInfo
            }, { quoted: message });
        }
        const cipherType = args[0].toLowerCase();
        const mode = args[1].toLowerCase();
        const key = args[2];
        const text = args.slice(3).join(' ').trim();
        if (!['caesar', 'vigenere', 'xor'].includes(cipherType)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Unknown cipher: *${cipherType}*\nUse: \`caesar\`, \`vigenere\`, or \`xor\``,
                ...channelInfo
            }, { quoted: message });
        }
        if (!['encode', 'decode', 'encrypt', 'decrypt'].includes(mode)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Unknown mode: *${mode}*\nUse: \`encode\` or \`decode\``,
                ...channelInfo
            }, { quoted: message });
        }
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: `❌ No text provided.`,
                ...channelInfo
            }, { quoted: message });
        }
        if (cipherType === 'caesar' && isNaN(parseInt(key, 10))) {
            return await sock.sendMessage(chatId, {
                text: `❌ Caesar cipher key must be a number (e.g. 13)`,
                ...channelInfo
            }, { quoted: message });
        }
        const encode = (mode === 'encode' || mode === 'encrypt');
        let result;
        try {
            if (cipherType === 'caesar') result = caesar(text, parseInt(key, 10), encode);
            else if (cipherType === 'vigenere') result = vigenere(text, key, encode);
            else result = xorCipher(text, key, encode);
        } catch (e) {
            return await sock.sendMessage(chatId, {
                text: `❌ Failed: ${String(e.message || e).slice(0, 120)}`,
                ...channelInfo
            }, { quoted: message });
        }
        const cipherNames = { caesar: 'Caesar', vigenere: 'Vigenère', xor: 'XOR' };
        const modeLabel = encode ? '🔒 Encrypted' : '🔓 Decrypted';
        await sock.sendMessage(chatId, {
            text: `🔐 *${cipherNames[cipherType]} Cipher*\n\n` +
                `📥 *Input:* \`${text}\`\n` +
                `🔑 *Key:* \`${key}\`\n` +
                `${modeLabel}: \`${result}\``,
            ...channelInfo
        }, { quoted: message });
    }
};

function shiftChar(ch, shift) {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) return String.fromCharCode(((c - 65 + shift) % 26 + 26) % 26 + 65);
    if (c >= 97 && c <= 122) return String.fromCharCode(((c - 97 + shift) % 26 + 26) % 26 + 97);
    return ch;
}

function caesar(text, key, encode) {
    const s = ((key % 26) + 26) % 26;
    const shift = encode ? s : -s;
    return [...text].map((ch) => shiftChar(ch, shift)).join('');
}

function vigenere(text, key, encode) {
    const k = String(key).replace(/[^A-Za-z]/g, '').toUpperCase();
    if (!k) throw new Error('Vigenere key me kam se kam ek letter chahiye.');
    let ki = 0;
    return [...text].map((ch) => {
        if (!/[A-Za-z]/.test(ch)) return ch;
        const shift = k.charCodeAt(ki % k.length) - 65;
        ki++;
        return shiftChar(ch, encode ? shift : -shift);
    }).join('');
}

function xorCipher(text, key, encode) {
    const kb = Buffer.from(String(key), 'utf8');
    if (!kb.length) throw new Error('XOR key khaali nahi ho sakti.');
    if (encode) {
        const tb = Buffer.from(text, 'utf8');
        const out = Buffer.alloc(tb.length);
        for (let i = 0; i < tb.length; i++) out[i] = tb[i] ^ kb[i % kb.length];
        return out.toString('hex');
    }
    const clean = text.replace(/\s+/g, '');
    if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length % 2 !== 0) {
        throw new Error('XOR decode ke liye hex string chahiye.');
    }
    const tb = Buffer.from(clean, 'hex');
    const out = Buffer.alloc(tb.length);
    for (let i = 0; i < tb.length; i++) out[i] = tb[i] ^ kb[i % kb.length];
    return out.toString('utf8');
}
