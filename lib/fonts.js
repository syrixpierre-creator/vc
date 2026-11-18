/**
* QUEEN AKUMA • 40 Unicode text styles (advanced level).
* QUEEN AKUMA style text-styles feature, expanded:.font1...font40,
*.style <number> <text>,.textstyles <text> (saare styles ek saath).
*/
function blockConvert(text, upper, lower, digit) {
return String(text).split('').map((ch) => {
const c = ch.charCodeAt(0);
if (c >= 65 && c <= 90 && upper) return String.fromCodePoint(upper + (c - 65));
if (c >= 97 && c <= 122 && lower) return String.fromCodePoint(lower + (c - 97));
if (c >= 48 && c <= 57 && digit) return String.fromCodePoint(digit + (c - 48));
return ch;
}).join('');
}
const CIRCLED = { A:'Ⓐ',B:'Ⓑ',C:'Ⓒ',D:'Ⓓ',E:'Ⓔ',F:'Ⓕ',G:'Ⓖ',H:'Ⓗ',I:'Ⓘ',J:'Ⓙ',K:'Ⓚ',L:'Ⓛ',M:'Ⓜ',N:'Ⓝ',O:'Ⓞ',P:'Ⓟ',Q:'Ⓠ',R:'Ⓡ',S:'Ⓢ',T:'Ⓣ',U:'Ⓤ',V:'Ⓥ',W:'Ⓦ',X:'Ⓧ',Y:'Ⓨ',Z:'Ⓩ', a:'ⓐ',b:'ⓑ',c:'ⓒ',d:'ⓓ',e:'ⓔ',f:'ⓕ',g:'ⓖ',h:'ⓗ',i:'ⓘ',j:'ⓙ',k:'ⓚ',l:'ⓛ',m:'ⓜ',n:'ⓝ',o:'ⓞ',p:'ⓟ',q:'ⓠ',r:'ⓡ',s:'ⓢ',t:'ⓣ',u:'ⓤ',v:'ⓥ',w:'ⓦ',x:'ⓧ',y:'ⓨ',z:'ⓩ', 0:'⓪',1:'①',2:'②',3:'③',4:'④',5:'⑤',6:'⑥',7:'⑦',8:'⑧',9:'⑨'};
const SMALLCAPS = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
const SQUARED = { A:'🅰',B:'🅱',C:'🅲',D:'🅳',E:'🅴',F:'🅵',G:'🅶',H:'🅷',I:'🅸',J:'🅹',K:'🅺',L:'🅻',M:'🅼',N:'🅽',O:'🅾',P:'🅿',Q:'🆀',R:'🆁',S:'🆂',T:'🆃',U:'🆄',V:'🆅',W:'🆆',X:'🆇',Y:'🆈',Z:'🆉'};
const BLACK_CIRCLED = { A:'🅐',B:'🅑',C:'🅒',D:'🅓',E:'🅔',F:'🅕',G:'🅖',H:'🅗',I:'🅘',J:'🅙',K:'🅚',L:'🅛',M:'🅜',N:'🅝',O:'🅞',P:'🅟',Q:'🅠',R:'🅡',S:'🅢',T:'🅣',U:'🅤',V:'🅥',W:'🅦',X:'🅧',Y:'🅨',Z:'🅩'};
const GREEK = { a:'α',b:'β',c:'ς',d:'δ',e:'ε',f:'φ',g:'γ',h:'η',i:'ι',j:'ϳ',k:'κ',l:'λ',m:'μ',n:'ν',o:'ο',p:'ρ',q:'θ',r:'π',s:'σ',t:'τ',u:'υ',v:'ν',w:'ω',x:'χ',y:'ψ',z:'ζ', A:'Α',B:'Β',C:'Σ',D:'Δ',E:'Ε',F:'Φ',G:'Γ',H:'Η',I:'Ι',J:'ϳ',K:'Κ',L:'Λ',M:'Μ',N:'Ν',O:'Ο',P:'Ρ',Q:'Θ',R:'Π',S:'Σ',T:'Τ',U:'Υ',V:'Ν',W:'Ω',X:'Χ',Y:'Ψ',Z:'Ζ'};
const UPSIDE = { a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ɓ',h:'ɥ',i:'ı',j:'ɾ',k:'ʞ',l:'l',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z', A:'∀',B:'ᗺ',C:'Ɔ',D:'ᗡ',E:'Ǝ',F:'Ⅎ',G:'⅁',H:'H',I:'I',J:'ᒐ',K:'ꓘ',L:'⅂',M:'W',N:'N',O:'O',P:'Ԁ',Q:'Ό',R:'ᴚ',S:'S',T:'⊥',U:'∩',V:'Λ',W:'M',X:'X',Y:'⅄',Z:'Z', 0:'0',1:'Ɩ',2:'ᒐ',3:'Ɛ',4:'ᔭ',5:'5',6:'9',7:'⅂',8:'8',9:'6'};
const SUPER = { a:'ᵃ',b:'ᵇ',c:'ᶜ',d:'ᵈ',e:'ᵉ',f:'ᶠ',g:'ᵍ',h:'ʰ',i:'ᶦ',j:'ʲ',k:'ᵏ',l:'ˡ',m:'ᵐ',n:'ⁿ',o:'ᵒ',p:'ᵖ',q:'۹',r:'ʳ',s:'ˢ',t:'ᵗ',u:'ᵘ',v:'ᵛ',w:'ʷ',x:'ˣ',y:'ʸ',z:'ᶻ', A:'ᴬ',B:'ᴮ',C:'ᶜ',D:'ᴰ',E:'ᴱ',F:'ᶠ',G:'ᴳ',H:'ᴴ',I:'ᴵ',J:'ᴶ',K:'ᴷ',L:'ᴸ',M:'ᴹ',N:'ᴺ',O:'ᴼ',P:'ᴾ',Q:'Q',R:'ᴿ',S:'ˢ',T:'ᵀ',U:'ᵁ',V:'ⱽ',W:'ᵂ',X:'ˣ',Y:'ʸ',Z:'ᶻ', 0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹'};
const PAREN = { a:'⒜',b:'⒝',c:'⒞',d:'⒟',e:'⒠',f:'⒡',g:'⒢',h:'⒣',i:'⒤',j:'⒥',k:'⒦',l:'⒧',m:'⒨',n:'⒩',o:'⒪',p:'⒫',q:'⒬',r:'⒭',s:'⒮',t:'⒯',u:'⒰',v:'⒱',w:'⒲',x:'⒳',y:'⒴',z:'⒵', 1:'⑴',2:'⑵',3:'⑶',4:'⑷',5:'⑸',6:'⑹',7:'⑺',8:'⑻',9:'⑼',0:'⓪'};
const LEET = { a:'4',b:'8',e:'3',g:'9',i:'1',l:'1',o:'0',s:'5',t:'7',z:'2', A:'4',B:'8',E:'3',G:'9',I:'1',L:'1',O:'0',S:'5',T:'7',Z:'2'};
const mapConvert = (map) => (t) => String(t).split('').map((c) => map[c] || c).join('');
const combining = (mark) => (t) => String(t).split('').map((c) => (c === ' '? c: c + mark)).join('');

const allFonts = [
{ name: 'Bold', convert: (t) => blockConvert(t, 0x1D400, 0x1D41A, 0x1D7CE)},
{ name: 'Italic', convert: (t) => blockConvert(t, 0x1D434, 0x1D44E, null)},
{ name: 'Bold Italic', convert: (t) => blockConvert(t, 0x1D468, 0x1D482, null)},
{ name: 'Monospace', convert: (t) => blockConvert(t, 0x1D670, 0x1D68A, 0x1D7F6)},
{ name: 'Script', convert: (t) => blockConvert(t, 0x1D49C, 0x1D4B6, null)},
{ name: 'Double-struck', convert: (t) => blockConvert(t, 0x1D538, 0x1D552, 0x1D7D8)},
{ name: 'Sans', convert: (t) => blockConvert(t, 0x1D5A0, 0x1D5BA, 0x1D7E2)},
{ name: 'Sans Bold', convert: (t) => blockConvert(t, 0x1D5D4, 0x1D5EE, 0x1D7EC)},
{ name: 'Fraktur', convert: (t) => blockConvert(t, 0x1D504, 0x1D51E, null)},
{ name: 'Fullwidth', convert: (t) => blockConvert(t, 0xFF21, 0xFF41, 0xFF10)},
{ name: 'Circled', convert: mapConvert(CIRCLED)},
{ name: 'Small Caps', convert: (t) => String(t).toLowerCase().split('').map((c) => SMALLCAPS[c] || c).join('')},
{ name: 'Strikethrough', convert: combining('̶')},
{ name: 'Underline', convert: combining('̲')},
{ name: 'Tiny', convert: (t) => String(t).toLowerCase().split('').map((c) => SMALLCAPS[c] || c).join('')},
{ name: 'Squared', convert: (t) => String(t).split('').map((c) => SQUARED[c.toUpperCase()] || c).join('')},
{ name: 'Bracketed', convert: (t) => String(t).split('').map((c) => (c === ' '? c: '[' + c + ']')).join('')},
{ name: 'Spaced', convert: (t) => String(t).split('').join(' ')},
{ name: 'Upside Down', convert: (t) => String(t).split('').map((c) => UPSIDE[c] || c).reverse().join('')},
{ name: 'Greek', convert: mapConvert(GREEK)},
{ name: 'Gothic Bold', convert: (t) => blockConvert(t, 0x1D56C, 0x1D586, 0x1D7CE)},
{ name: 'Sans Italic', convert: (t) => blockConvert(t, 0x1D608, 0x1D622, null)},
{ name: 'Sans Bold Italic', convert: (t) => blockConvert(t, 0x1D63C, 0x1D656, null)},
{ name: 'Script Bold', convert: (t) => blockConvert(t, 0x1D4D0, 0x1D4EA, null)},
{ name: 'Wavy', convert: combining('̃')},
{ name: 'Dotted', convert: combining('̇')},
{ name: 'Double Underline', convert: combining('̳')},
{ name: 'Leet', convert: mapConvert(LEET)},
{ name: 'Vaporwave', convert: (t) => blockConvert(t, 0xFF21, 0xFF41, 0xFF10).split('').join(' ')},
{ name: 'Superscript', convert: mapConvert(SUPER)},
{ name: 'Hearts', convert: (t) => String(t).split(/\s+/).join(' ❤ ')},
{ name: 'Starry', convert: (t) => String(t).split(/\s+/).join(' ★ ')},
{ name: 'Arrow', convert: (t) => String(t).split(/\s+/).join(' ➤ ')},
{ name: 'Zalgo Light', convert: (t) => String(t).split('').map((c) => (c === ' '? c: c + '̸̀')).join('')},
{ name: 'Cute Brackets', convert: (t) => String(t).split('').map((c) => (c === ' '? c: '【' + c + '】')).join('')},
{ name: 'Parenthesized', convert: (t) => String(t).split('').map((c) => PAREN[c] || (/[A-Z]/.test(c)? '(' + c + ')': c)).join('')},
{ name: 'Black Circled', convert: (t) => String(t).split('').map((c) => BLACK_CIRCLED[c.toUpperCase()] || c).join('')},
{ name: 'Reverse', convert: (t) => String(t).split('').reverse().join('')},
{ name: 'Mirror', convert: (t) => String(t).split('').map((c) => UPSIDE[c] || c).join('')},
{ name: 'Neon', convert: (t) => Array.from(blockConvert(t, 0x1D400, 0x1D41A, 0x1D7CE)).map((c) => (c === ' '? c: c + '̲')).join('')},
];

function convertText(text, font) {
if (typeof font === 'function') return font(text);
if (font && typeof font.convert === 'function') return font.convert(text);
return String(text);
}

function toFancy(text) {
return allFonts[0].convert(text);
}

module.exports = { allFonts, convertText, toFancy};
